import {
  HttpProblems,
  Logger,
  ZuploContext,
  ZuploRequest,
} from "@zuplo/runtime";
import { MAX_BIN_SIZE, USE_SUBDOMAIN, requiredEnvVariable } from "./env";
import { nanoid } from "./nanoid";
import {
  GetObjectResult,
  ListObjectsResult,
  StorageClient,
  StorageError,
} from "./storage";
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
) {
  if (err instanceof StorageError) {
    if (err.status === 404) {
      return HttpProblems.notFound(request, context);
    } else {
      return HttpProblems.internalServerError(request, context, {
        detail: err.message,
      });
    }
  }
  return HttpProblems.internalServerError(request, context);
}

async function getBinFromStorage(storage: StorageClient, binId: string) {
  const response = await storage.getObject(`${binId}.json`);
  const data: BinResponse = JSON.parse(response.body);
  return data;
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

  const size = sizeInBytes(body);

  // Enforce maximum bin size
  if (size > MAX_BIN_SIZE) {
    return HttpProblems.badRequest(request, context, {
      detail: `The bin size exceeded the maximum allowed size of ${MAX_BIN_SIZE} bytes`,
    });
  }

  try {
    await storage.uploadObject(`${binId}.json`, body);
  } catch (err) {
    context.log.error(err);
    return getProblemFromStorageError(err, request, context);
  }

  const mockUrl = new URL(
    USE_SUBDOMAIN ? `https://${binId}.api.${url.hostname}` : url,
  );
  mockUrl.pathname = USE_SUBDOMAIN ? "/" : `/${binId}`;

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
    data = await getBinFromStorage(storage, binId);
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

  const data = response.map((r) => ({
    requestId: r.key.substring(binId.length + 1, r.key.length - ".json".length),
    timestamp: r.lastModified,
    size: r.size,
    // method: r.customMetadata?.method,
    // pathname: r.customMetadata?.pathname,
  }));
  return { data };
}

export async function invokeBin(request: ZuploRequest, context: ZuploContext) {
  const { binId } = request.params;

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
  const body = request.body ? await request.text() : null;

  const req: RequestDetails = {
    method: request.method,
    headers,
    body,
    url: {
      pathname: url.pathname,
      search: url.search,
    },
  };

  const storage = storageClient(context.log);

  const data = JSON.stringify(req);
  const size = sizeInBytes(data);

  // Enforce maximum request size
  if (size > MAX_BIN_SIZE) {
    return HttpProblems.badRequest(request, context, {
      detail: `The request size including (body and headers) exceeded the maximum allowed size of ${MAX_BIN_SIZE} bytes`,
    });
  }

  storage
    .uploadObject(`${binId}/${requestId}.json`, data, {
      method: request.method,
      pathname: url.pathname,
    })
    .catch((err) => {
      context.log.error("Error saving request to storage", err);
    });

  let binResponse: BinResponse;
  try {
    binResponse = await getBinFromStorage(storage, binId);
  } catch (err) {
    return getProblemFromStorageError(err, request, context);
  }

  const response = new Response(binResponse.response?.body ?? null, {
    headers: binResponse.response?.headers,
    status: binResponse.response?.status,
    statusText: binResponse.response?.statusText,
  });
  return response;
}
