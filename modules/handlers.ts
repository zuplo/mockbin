import {
  HttpProblems,
  Logger,
  ZuploContext,
  ZuploRequest,
} from "@zuplo/runtime";
import {
  CF_ACCOUNT_ID,
  R2_API_KEY,
  R2_BUCKET_NAME,
  USE_SUBDOMAIN,
} from "./env";
import { nanoid } from "./nanoid";
import {
  CloudflareApiResponse,
  CloudflareError,
  CloudflareR2Client,
  ListObjectsResult,
} from "./storage";
import { BinResponse, RequestDetails } from "./types";

function r2Client(logger: Logger) {
  const r2 = new CloudflareR2Client({
    apiKey: R2_API_KEY,
    accountId: CF_ACCOUNT_ID,
    bucketName: R2_BUCKET_NAME,
    logger,
  });
  return r2;
}

function getProblemFromStorageError(
  err: unknown,
  request: ZuploRequest,
  context: ZuploContext,
) {
  if (err instanceof CloudflareError) {
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

async function getBinFromStorage(r2: CloudflareR2Client, binId: string) {
  const response = await r2.getObject(`${binId}.json`);
  const data: BinResponse = await response.json();
  return data;
}

export async function createMockResponse(
  request: ZuploRequest,
  context: ZuploContext,
) {
  const url = new URL(request.url);
  const binId = nanoid();

  const r2 = r2Client(context.log);

  try {
    await r2.uploadObject(`${binId}.json`, request.body ?? "");
  } catch (err) {
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

  return new Response(JSON.stringify(responseData, null, 2),
    {
      status: 201,
      statusText: "Created"
    });

}

export async function getMockResponse(
  request: ZuploRequest,
  context: ZuploContext,
) {
  const { binId } = request.params;

  const r2 = r2Client(context.log);
  // TODO
  // 1. Get the JSON from the file at /{binId}.json
  // 2. Deserialize into JSON as below, and return
  let data: BinResponse;
  try {
    data = await getBinFromStorage(r2, binId);
  } catch (err) {
    return getProblemFromStorageError(err, request, context);
  }

  // TODO: Handle errors

  return data;
}

export async function getRequest(request: ZuploRequest, context: ZuploContext) {
  const { binId, requestId } = request.params;

  const r2 = r2Client(context.log);

  let response: Response;
  try {
    response = await r2.getObject(`${binId}/${requestId}.json`);
  } catch (err) {
    return getProblemFromStorageError(err, request, context);
  }
  const result: RequestDetails = await response.json();
  return result;
}

export async function listRequests(
  request: ZuploRequest,
  context: ZuploContext,
) {
  const { binId } = request.params;

  const r2 = r2Client(context.log);
  let response: CloudflareApiResponse<ListObjectsResult>;

  try {
    response = await r2.listObjects(`${binId}/`);
  } catch (err) {
    return getProblemFromStorageError(err, request, context);
  }

  const data = response.result.map((r) => ({
    requestId: r.key.substring(binId.length + 1, r.key.length - ".json".length),
    timestamp: r.last_modified,
    method: r.custom_metadata?.method,
    pathname: r.custom_metadata?.pathname,
  }));
  return { data };
}

export async function invokeBin(request: ZuploRequest, context: ZuploContext) {
  const { binId } = request.params;

  const headers: Record<string, string> = {};
  for (const [key, value] of request.headers) {
    headers[key] = value;
  }

  const requestId = `req-${encodeURIComponent(
    new Date().toISOString(),
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

  const r2 = r2Client(context.log);

  const [saveRequestResponse, mockResponsePromise] = await Promise.allSettled([
    r2.uploadObject(`${binId}/${requestId}.json`, JSON.stringify(req), {
      method: request.method,
      pathname: url.pathname,
    }),
    getBinFromStorage(r2, binId),
  ]);

  if (saveRequestResponse.status === "rejected") {
    context.log.error(
      "Error saving request to storage",
      saveRequestResponse.reason,
    );
  }

  if (mockResponsePromise.status === "rejected") {
    return getProblemFromStorageError(
      mockResponsePromise.reason,
      request,
      context,
    );
  }

  const mockResponse = mockResponsePromise.value;

  const response = new Response(mockResponse.body, {
    headers: mockResponse.headers,
    status: mockResponse.status,
    statusText: mockResponse.statusText,
  });
  return response;
}
