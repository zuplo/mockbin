import { BinResponse, RequestDetails, RequestsResponse } from "./types";
import { environment, ZuploContext } from "@zuplo/runtime";
import { CloudflareR2Client } from "./r2";


const r2 = new CloudflareR2Client({
  apiKey: environment.R2_API_KEY,
  accountId: environment.CF_ACCOUNT_ID,
  bucketName: environment.R2_BUCKET_NAME
});

export async function uploadResponse(binId: string, binResponse: BinResponse) {
  // TODO 
  // 1. create a file with the name {binId}.json
  await r2.uploadObject(`${binId}.json`, JSON.stringify(binResponse));
}

export async function getResponse(binId: string): Promise<BinResponse> {
  // TODO
  // 1. Get the JSON from the file at /{binId}.json
  // 2. Deserialize into JSON as below, and return
  const response = await r2.getObject(`${binId}.json`);
  // TODO: Handle errors
  const data: BinResponse = await response.json();

  return data;
}

export async function listRequests(binId: string): Promise<RequestsResponse> {
  // TODO
  // 1. List files in /{binId}/ folder
  // 2. If not found, return error that indicates not found clearly so we can respond 404
  const response = await r2.listObjects(`${binId}/`)
  // TODO: Handle errors
  const data = response.result.map((r) => ({
    requestId: r.key.substring(binId.length + 1, r.key.length - ".json".length),
    timestamp: r.last_modified,
    method: r.custom_metadata?.method,
    pathname: r.custom_metadata?.pathname,
  }))
  return { data };
}

export async function getRequest(binId: string, requestId: string): Promise<RequestDetails> {
  // TODO
  // 1. Get the JSON from the file at /{binId}/{requestId}.json
  // 2. If not found, return clear not found error so we can response 404 too
  return {} as RequestDetails;
}

export async function uploadRequest(binId: string, request: RequestDetails, context: ZuploContext) {
  const requestId = `req-${encodeURIComponent(new Date().toISOString())}-${context.requestId}`;
  const response = await r2.uploadObject(`${binId}/${requestId}.json`, JSON.stringify(request), {
    method: request.method,
    pathname: request.url.pathname,
  });
  // TODO: Handle errors
}