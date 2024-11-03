import { HttpProblems, ZuploContext, ZuploRequest } from "@zuplo/runtime";
import { logAnalytics } from "./analytics";
import { MockServer } from "./mock-server";
import { GetObjectResult, ListObjectsResult, storageClient } from "./storage";
import { BinResponse, RequestData, RequestDetails } from "./types";
import {
  getBinFromUrl,
  getInvokeBinUrl,
  getProblemFromStorageError,
  validateBinId,
} from "./utils";

const MAX_SIZE = 1048576;

export async function createMockResponse(
  request: ZuploRequest,
  context: ZuploContext,
) {
  const url = new URL(request.url);
  let binId = crypto.randomUUID().replaceAll("-", "");

  const storage = storageClient(context.log);

  const contentType = request.headers.get("content-type");

  context.log.info({ contentType });

  let body: string;

  // standard mock
  if (contentType.includes("application/json")) {
    body = await request.text();
    const size = new TextEncoder().encode(JSON.stringify(body)).length;
    if (size > MAX_SIZE) {
      return HttpProblems.badRequest(request, context, {
        detail: `Mock size cannot be larger than ${MAX_SIZE} bytes`,
      });
    }
  }
  // open api mock
  else if (contentType.indexOf('multipart/form-data') === 0) {

    binId += "_oas";
    const formData = await request.formData();
    body = await readFirstFileInFormData(formData, context);

    if (body === undefined) {
      return HttpProblems.badRequest(request, context, { detail: "No file attachment found" });
    }

    // TODO - check for YAML and convert, keep original
  }
  // bad content type
  else {
    return HttpProblems.badRequest(request, context, { detail: `Invalid content-type '${contentType}'` });
  }

  try {
    await storage.uploadObject(`${binId}.json`, body);
    context.log.info({binId, body});
  } catch (err) {
    context.log.error(err);
    return getProblemFromStorageError(err, request, context);
  }

  const mockUrl = getInvokeBinUrl(url, binId);

  const responseData = {
    id: binId,
    url: mockUrl.href,
  };

  context.log.debug({ message: "bin_created",  binId });
  context.waitUntil(logAnalytics("bin_created", { binId }));

  return new Response(JSON.stringify(responseData, null, 2), {
    status: 201,
    statusText: "Created",
  });
}

async function readFirstFileInFormData(formData: FormData, context: ZuploContext) {
  let fileContents;
  for (const [name, value] of formData.entries()) {
    // Check if the value is a file (Blob) and not a regular string field
    if (value instanceof File) {
      fileContents = await value.text(); // Read file contents as a string
      return fileContents; // Exit loop after finding the first file
    }
  }
}

export async function getMockResponse(
  request: ZuploRequest,
  context: ZuploContext,
) {
  const url = new URL(request.url);
  const { binId } = request.params;
  if (!validateBinId(binId)) {
    return HttpProblems.badRequest(request, context, { detail: "Invalid binId" });
  }

  const storage = storageClient(context.log);
  let data: BinResponse;
  try {
    const response = await storage.getObject(`${binId}.json`);
    data = JSON.parse(response.body);
    data.url = getInvokeBinUrl(url, binId).href;
  } catch (err) {
    context.log.error(err);
    return getProblemFromStorageError(err, request, context);
  }

  return data;
}

export async function listRequests(
  request: ZuploRequest,
  context: ZuploContext,
) {
  const url = new URL(request.url);
  const { binId } = request.params;
  if (!validateBinId(binId)) {
    return HttpProblems.badRequest(request, context, { detail: "Invalid binId" });
  }

  const storage = storageClient(context.log);
  let response: ListObjectsResult[];

  try {
    response = await storage.listObjects({ prefix: `${binId}/`, limit: 100 });
  } catch (err) {
    context.log.error(err);
    return getProblemFromStorageError(err, request, context);
  }

  const data = response.map((r) => {
    const requestId = r.key.substring(
      binId.length + 1,
      r.key.length - ".json".length,
    );
    const parts = requestId.split("-");
    return {
      id: requestId,
      method: parts[2],
      timestamp: r.lastModified,
      size: r.size,
    };
  });

  const mockUrl = getInvokeBinUrl(url, binId).href;

  return { data, url: mockUrl };
}

export async function getRequest(request: ZuploRequest, context: ZuploContext) {
  const { binId, requestId } = request.params;

  if (!validateBinId(binId)) {
    return HttpProblems.badRequest(request, context, { detail: "Invalid binId" });
  }

  const storage = storageClient(context.log);

  let response: GetObjectResult;
  try {
    response = await storage.getObject(`${binId}/${requestId}.json`);
  } catch (err) {
    context.log.error(err);
    return getProblemFromStorageError(err, request, context);
  }

  if (!response.lastModified) {
    throw new Error("Invalid response from storage");
  }

  let data: RequestData = JSON.parse(response.body);

  const body: RequestDetails = {
    ...data,
    id: requestId,
    timestamp: response.lastModified.toISOString(),
  };

  context.waitUntil(logAnalytics("bin_request_viewed", { binId, requestId }));

  return body;
}

export async function invokeBin(request: ZuploRequest, context: ZuploContext) {
  const url = new URL(request.url);
  // If the url is the root of api.mockbin.io (not a bin) redirect to docs
  if (url.hostname === "api.mockbin.com" && url.pathname === "/") {
    return Response.redirect("https://api.mockbin.io/docs");
  }

  const urlInfo = getBinFromUrl(url);

  if (!urlInfo) {
    return HttpProblems.badRequest(request, context, {
      detail: "No binId specified in request",
    });
  }
  const { binId } = urlInfo;

  if (!validateBinId(binId)) {
    return HttpProblems.badRequest(request, context, { detail: 'Invalid Bin' });
  }

  if (!binId) {
    return HttpProblems.badRequest(request, context, {
      detail: "No binId specified in request",
    });
  }

  const storage = storageClient(context.log);

  let binResult: GetObjectResult;
  try {
    binResult = await storage.getObject(`${binId}.json`);
  } catch (err) {
    return getProblemFromStorageError(err, request, context, {
      detail: "Error retrieving bin from storage",
    });
  }

  let binResponse: BinResponse;
  try {
    binResponse = JSON.parse(binResult.body);
  } catch (err) {
    context.log.error({err});
    return HttpProblems.internalServerError(request, context, {
      detail:
        "Invalid bin found in storage. The bin is corrupt, create a new mock and try again.",
    });
  }

  if (binId.indexOf("_oas") > 0) {
    const mockServer = new MockServer(binResponse);
    return mockServer.handleRequest(removeBinPath(request));
  }

  const headers = new Headers(binResponse.response?.headers);
  if (!headers.has("Cache-Control")) {
    headers.set("Cache-Control", "no-cache");
  }

  const response = new Response(binResponse.response?.body ?? null, {
    headers,
    status: binResponse.response?.status,
    statusText: binResponse.response?.statusText,
  });
  return response;
}

function removeBinPath(request) {
    const url = new URL(request.url);

    // Split the pathname into parts
    const pathParts = url.pathname.split('/').filter(part => part); // filter removes empty parts

    // Remove the first part from the path
    if (pathParts.length > 0) {
        pathParts.shift(); // Remove the first part
    }

    // Join the remaining parts back into a path
    url.pathname = '/' + pathParts.join('/');

    // Clone the request with the modified URL
    const modifiedRequest = new Request(url.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: request.redirect,
    });

    return modifiedRequest;
}
