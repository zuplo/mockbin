import { HttpProblems, ZuploContext, ZuploRequest } from "@zuplo/runtime";
import { USE_WILDCARD_SUBDOMAIN } from "./env";
import { nanoid } from "./nanoid";
import {
  GetObjectResult,
  ListObjectsResult,
  StorageError,
  storageClient,
} from "./storage";
import { BinResponse } from "./types";

const MAX_SIZE = 1048576;

function getProblemFromStorageError(
  err: unknown,
  request: ZuploRequest,
  context: ZuploContext,
  overrides?: { detail: string },
) {
  if (err instanceof StorageError) {
    if (err.status === 404) {
      return HttpProblems.notFound(request, context, overrides);
    } else {
      return HttpProblems.internalServerError(request, context, {
        detail: err.message,
        ...(overrides ?? {}),
      });
    }
  }
  return HttpProblems.internalServerError(request, context, overrides);
}

export async function createMockResponse(
  request: ZuploRequest,
  context: ZuploContext,
) {
  const url = new URL(request.url);
  const binId = nanoid();

  const storage = storageClient(context.log);

  const body = await request.text();
  const size = new TextEncoder().encode(JSON.stringify(body)).length;
  if (size > MAX_SIZE) {
    return HttpProblems.badRequest(request, context, {
      detail: `Mock size cannot be larger than ${MAX_SIZE} bytes`,
    });
  }

  try {
    await storage.uploadObject(`${binId}.json`, body);
  } catch (err) {
    context.log.error(err);
    return getProblemFromStorageError(err, request, context);
  }

  const mockUrl = new URL(
    USE_WILDCARD_SUBDOMAIN ? `https://${binId}.${url.hostname}` : url,
  );
  mockUrl.pathname = USE_WILDCARD_SUBDOMAIN ? "/" : `/${binId}`;

  const responseData = {
    id: binId,
    url: mockUrl.href,
  };

  return new Response(JSON.stringify(responseData, null, 2), {
    status: 201,
    statusText: "Created",
  });
}

export async function getMockResponse(
  request: ZuploRequest,
  context: ZuploContext,
) {
  const { binId } = request.params;

  const storage = storageClient(context.log);
  let data: BinResponse;
  try {
    const response = await storage.getObject(`${binId}.json`);
    data = JSON.parse(response.body);
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
  const { binId } = request.params;

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
  return { data };
}

export async function getRequest(request: ZuploRequest, context: ZuploContext) {
  const { binId, requestId } = request.params;

  const storage = storageClient(context.log);

  let response: GetObjectResult;
  try {
    response = await storage.getObject(`${binId}/${requestId}.json`);
  } catch (err) {
    context.log.error(err);
    return getProblemFromStorageError(err, request, context);
  }
  return new Response(response.body, {
    headers: {
      "content-type": "application/json",
    },
  });
}

export async function invokeBin(request: ZuploRequest, context: ZuploContext) {
  const { binId } = request.params;

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
    return HttpProblems.internalServerError(request, context, {
      detail:
        "Invalid bin found in storage. The bin is corrupt, create a new mock and try again.",
    });
  }

  const response = new Response(binResponse.response?.body ?? null, {
    headers: binResponse.response?.headers,
    status: binResponse.response?.status,
    statusText: binResponse.response?.statusText,
  });
  return response;
}
