import {
  HttpProblems,
  Logger,
  ZuploContext,
  ZuploRequest,
} from "@zuplo/runtime";
import { USE_WILDCARD_SUBDOMAIN, requiredEnvVariable } from "./env";
import { nanoid } from "./nanoid";
import { GetObjectResult, StorageClient, StorageError } from "./storage";
import { BinResponse, RequestDetails } from "./types";

function storageClient(logger: Logger) {
  const client = new StorageClient({
    endpoint: requiredEnvVariable("S3_ENDPOINT"),
    accessKeyId: requiredEnvVariable("S3_ACCESS_KEY_ID"),
    accessKeySecret: requiredEnvVariable("S3_SECRET_ACCESS_KEY"),
    bucketName: requiredEnvVariable("BUCKET_NAME"),
    logger,
  });
  return client;
}

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

function sizeInBytes(data: string) {
  return new TextEncoder().encode(JSON.stringify(data)).length;
}

export async function createMockResponse(
  request: ZuploRequest,
  context: ZuploContext,
) {
  const url = new URL(request.url);
  const binId = nanoid();

  const storage = storageClient(context.log);

  const body = await request.text();

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
  const result: RequestDetails = JSON.parse(response.body);
  return result;
}

export async function invokeBin(request: ZuploRequest, context: ZuploContext) {
  const { binId } = request.params;

  if (!binId) {
    return HttpProblems.badRequest(request, context, {
      detail: "No binId specified in request",
    });
  }

  const headers: Record<string, string> = {};
  for (const [key, value] of request.headers) {
    if (!key.startsWith("cf-")) {
      headers[key] = value;
    }
  }

  const requestId = `req-${encodeURIComponent(
    Date.now(),
  )}-${context.requestId.replaceAll("-", "")}`;

  const url = new URL(request.url);
  const body = request.body ? await request.blob() : null;

  const req: RequestDetails = {
    id: requestId,
    method: request.method,
    headers,
    timestamp: new Date().toISOString(),
    size: body?.size ?? 0,
    url: {
      pathname: url.pathname,
      search: url.search,
    },
  };

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

  const updateResponses = async () => {
    binResponse.requests = binResponse.requests ?? [];
    if (binResponse.requests.length > 100) {
      binResponse.requests.pop();
    }
    binResponse.requests.unshift(req);
    await Promise.all([
      storage.uploadObject(`${binId}/${requestId}.json`, body as Blob),
      storage.uploadObject(`${binId}.json`, JSON.stringify(binResponse)),
    ]);
  };

  context.waitUntil(updateResponses());

  const response = new Response(binResponse.response?.body ?? null, {
    headers: binResponse.response?.headers,
    status: binResponse.response?.status,
    statusText: binResponse.response?.statusText,
  });
  return response;
}
