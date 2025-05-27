import { HttpProblems, ZuploContext, ZuploRequest } from "@zuplo/runtime";
import { logAnalytics } from "./analytics";
import { MockServer } from "./mock-server";
import { GetObjectResult, ListObjectsResult, storageClient } from "./storage";
import { BinResponse, RequestData, RequestDetails } from "./types";
import {
  getBinFromUrl,
  getInvokeBinUrl,
  getProblemFromStorageError,
  isOasBin,
  validateBinId,
  validateOpenApiDocument,
} from "./utils";
import { default as yaml } from "./third-party/yaml/index";

const MAX_SIZE = 1_048_576;

// Common types for operation context
interface MockOperationContext {
  binId: string;
  secretId: string;
  storage: any;
  url: URL;
  isUpdate: boolean;
}

interface ParsedOpenApiContent {
  parsedContent: any;
  isYaml: boolean;
  body: string;
}

// Common helper functions
function validateContentSize(content: string): void {
  const size = new TextEncoder().encode(content).length;
  if (size > MAX_SIZE) {
    throw new Error(`Mock size cannot be larger than ${MAX_SIZE} bytes`);
  }
}

function createMockMetadata(secretId: string, isUpdate: boolean, existingMetadata?: any) {
  const now = new Date().toISOString();
  return {
    secretId,
    createdAt: isUpdate ? (existingMetadata?.createdAt || now) : now,
    ...(isUpdate && { updatedAt: now }),
  };
}

function createMockResponseData(context: MockOperationContext, includeSecret = true) {
  const mockUrl = getInvokeBinUrl(context.url, context.binId);
  return {
    id: context.binId,
    url: mockUrl.href,
    ...(includeSecret && { secret: context.secretId }),
  };
}

async function parseOpenApiContent(body: string, context: ZuploContext): Promise<ParsedOpenApiContent> {
  let isYaml = false;
  let parsedContent;

  // Attempt to parse the content as YAML or JSON
  try {
    parsedContent = yaml.parse(body);
    isYaml = true;
  } catch (yamlError) {
    // Not YAML, try JSON
    context.log.debug({ message: "Yaml.parse failed", yamlError });
    try {
      parsedContent = JSON.parse(body);
    } catch (jsonError) {
      throw new Error(
        "Invalid OpenAPI file format. The file must be valid JSON or YAML.",
      );
    }
  }

  // Validate OpenAPI Document using the parsed content
  try {
    validateOpenApiDocument(parsedContent);
  } catch (validationError) {
    throw new Error(`OpenAPI validation error: ${validationError.message}`);
  }

  return { parsedContent, isYaml, body };
}

async function handleYamlOriginal(
  context: MockOperationContext,
  body: string,
  parsedContent: any
): Promise<void> {
  // Save the original YAML file
  const yamlBinId = `${context.binId}_YAML_original`;
  await context.storage.uploadObject(`${yamlBinId}.yaml`, body);
  const yamlUrl = getInvokeBinUrl(context.url, yamlBinId);
  
  // Add x-mockbin-original-url to the parsed content
  parsedContent["x-mockbin-original-url"] = yamlUrl.href;
}

async function readFirstFileInFormData(
  formData: FormData,
  context: ZuploContext,
) {
  for (const [name, value] of formData.entries()) {
    // Check if the value is a file (Blob) and not a regular string field
    if (value instanceof File) {
      return await value.text(); // Read file contents as a string
    }
  }
  return undefined;
}

// Unified mock handlers
async function handleStandardMock(
  request: any,
  context: ZuploContext,
  operationContext: MockOperationContext
) {
  const body = await request.text();
  validateContentSize(body);

  let existingMetadata;
  if (operationContext.isUpdate) {
    const existingBinResult = await operationContext.storage.getObject(`${operationContext.binId}.json`);
    existingMetadata = existingBinResult.metadata;
  }

  const metadata = createMockMetadata(operationContext.secretId, operationContext.isUpdate, existingMetadata);
  await operationContext.storage.uploadObject(`${operationContext.binId}.json`, body, metadata);
  
  const logData: any = { binId: operationContext.binId };
  if (operationContext.isUpdate) logData.action = "updated";
  context.log.info(logData);

  return createMockResponseData(operationContext, !operationContext.isUpdate);
}

async function handleOpenApiMock(
  request: any,
  context: ZuploContext,
  operationContext: MockOperationContext
) {
  const formData = await request.formData();
  const body = await readFirstFileInFormData(formData, context);

  if (body === undefined) {
    throw new Error("No file attachment found");
  }

  const { parsedContent, isYaml } = await parseOpenApiContent(body, context);

  if (isYaml) {
    await handleYamlOriginal(operationContext, body, parsedContent);
  }

  // Convert the parsed content to a JSON string
  const jsonBody = JSON.stringify(parsedContent, null, 2);
  validateContentSize(jsonBody);

  let existingMetadata;
  if (operationContext.isUpdate) {
    const existingBinResult = await operationContext.storage.getObject(`${operationContext.binId}.json`);
    existingMetadata = existingBinResult.metadata;
  }

  const metadata = createMockMetadata(operationContext.secretId, operationContext.isUpdate, existingMetadata);
  await operationContext.storage.uploadObject(`${operationContext.binId}.json`, jsonBody, metadata);
  
  const logData: any = { binId: operationContext.binId };
  if (operationContext.isUpdate) logData.action = "updated";
  context.log.info(logData);

  return createMockResponseData(operationContext, !operationContext.isUpdate);
}

// Main endpoint handlers
export async function createMockResponse(request, context) {
  const url = new URL(request.url);
  let binId = crypto.randomUUID().replaceAll("-", "");
  const secretId = crypto.randomUUID().replaceAll("-", "");
  const storage = storageClient(context.log);
  const contentType = request.headers.get("content-type") ?? "";
  let isOpenApi = false;

  try {
    let responseData;
    
    if (contentType.startsWith("multipart/form-data")) {
      isOpenApi = true;
      binId += "_oas";
    }

    const operationContext: MockOperationContext = {
      binId,
      secretId,
      storage,
      url,
      isUpdate: false,
    };

    if (contentType.includes("application/json")) {
      responseData = await handleStandardMock(request, context, operationContext);
    } else if (contentType.startsWith("multipart/form-data")) {
      responseData = await handleOpenApiMock(request, context, operationContext);
    } else {
      return HttpProblems.badRequest(request, context, {
        detail: `Invalid content-type '${contentType}'`,
      });
    }

    context.log.debug({ message: "bin_created", binId });
    context.waitUntil(
      logAnalytics(isOpenApi ? "openapi_bin_created" : "bin_created", {
        binId,
      }),
    );

    return new Response(JSON.stringify(responseData, null, 2), {
      status: 201,
      statusText: "Created",
    });
  } catch (err) {
    context.log.error(err);
    return HttpProblems.internalServerError(request, context, {
      detail: err.message,
    });
  }
}

export async function updateMockResponse(
  request: ZuploRequest,
  context: ZuploContext,
) {
  const url = new URL(request.url);
  const { binId } = request.params;
  
  if (!validateBinId(binId)) {
    return HttpProblems.badRequest(request, context, {
      detail: "Invalid binId",
    });
  }

  const providedSecret = request.headers.get("x-mockbin-secret");
  if (!providedSecret) {
    return HttpProblems.unauthorized(request, context, {
      detail: "Missing x-mockbin-secret header",
    });
  }

  const storage = storageClient(context.log);
  const contentType = request.headers.get("content-type") ?? "";
  let isOpenApi = false;

  try {
    // First, check if the bin exists and validate the secret
    let existingBinResult: GetObjectResult;
    try {
      existingBinResult = await storage.getObject(`${binId}.json`);
    } catch (err) {
      return getProblemFromStorageError(err, request, context);
    }

    // Validate the secret from metadata
    if (!existingBinResult.metadata?.secretId || existingBinResult.metadata.secretId !== providedSecret) {
      return HttpProblems.unauthorized(request, context, {
        detail: "Invalid secret",
      });
    }

    const operationContext: MockOperationContext = {
      binId,
      secretId: providedSecret,
      storage,
      url,
      isUpdate: true,
    };

    let responseData;

    if (contentType.includes("application/json")) {
      responseData = await handleStandardMock(request, context, operationContext);
    } else if (contentType.startsWith("multipart/form-data")) {
      isOpenApi = true;
      responseData = await handleOpenApiMock(request, context, operationContext);
    } else {
      return HttpProblems.badRequest(request, context, {
        detail: `Invalid content-type '${contentType}'`,
      });
    }

    context.log.debug({ message: "bin_updated", binId });
    context.waitUntil(
      logAnalytics(isOpenApi ? "openapi_bin_updated" : "bin_updated", {
        binId,
      }),
    );

    return new Response(JSON.stringify(responseData, null, 2), {
      status: 200,
      statusText: "OK",
    });
  } catch (err) {
    context.log.error(err);
    return HttpProblems.internalServerError(request, context, {
      detail: err.message,
    });
  }
}

export async function getMockResponse(
  request: ZuploRequest,
  context: ZuploContext,
) {
  const url = new URL(request.url);
  const { binId } = request.params;
  if (!validateBinId(binId)) {
    return HttpProblems.badRequest(request, context, {
      detail: "Invalid binId",
    });
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
    return HttpProblems.badRequest(request, context, {
      detail: "Invalid binId",
    });
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
    return HttpProblems.badRequest(request, context, {
      detail: "Invalid binId",
    });
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
    return HttpProblems.badRequest(request, context, { detail: "Invalid Bin" });
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
    context.log.error({ err });
    return HttpProblems.internalServerError(request, context, {
      detail:
        "Invalid bin found in storage. The bin is corrupt, create a new mock and try again.",
    });
  }

  if (isOasBin(binId)) {
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
  const pathParts = url.pathname.split("/").filter((part) => part); // filter removes empty parts

  // Remove the first part from the path
  if (pathParts.length > 0) {
    pathParts.shift(); // Remove the first part
  }

  // Join the remaining parts back into a path
  url.pathname = "/" + pathParts.join("/");

  // Clone the request with the modified URL
  const modifiedRequest = new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: request.redirect,
  });

  return modifiedRequest;
}
