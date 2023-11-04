import { AwsClient } from "./aws";
import { BinResponse, RequestDetails, RequestsResponse } from "./types";
import { environment, ZuploContext } from "@zuplo/runtime";

const R2_ACCESS_KEY_ID = environment.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = environment.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_URL = environment.R2_BUCKET_URL;

const aws = new AwsClient({
  accessKeyId: R2_ACCESS_KEY_ID,
  secretAccessKey: R2_SECRET_ACCESS_KEY,
  service: "s3"
});

export async function uploadResponse(binId: string, content: string) {
  // TODO 
  // 1. create a file with the name {binId}.json
  const r2Response = await aws.fetch(`${R2_BUCKET_URL}/${binId}.json`, {
    method: "PUT",
    body: content,
  });
}

export async function listRequests(binId: string): Promise<RequestsResponse> {
  // TODO
  // 1. List files in /{binId}/ folder
  // 2. If not found, return error that indicates not found clearly so we can respond 404
  return { data: [] };
}

export async function getResponse(binId: string): Promise<BinResponse> {
  // TODO
  // 1. Get the JSON from the file at /{binId}.json
  // 2. Deserialize into JSON as below, and return
  const fileResponse = await aws.fetch(`${R2_BUCKET_URL}/${binId}.json`, {
    method: "GET"
  });

  const data: BinResponse = await fileResponse.json();

  return data;
}

export async function getRequest(binId: string, requestId: string): Promise<RequestDetails> {
  // TODO
  // 1. Get the JSON from the file at /{binId}/{requestId}.json
  // 2. If not found, return clear not found error so we can response 404 too
  return {} as RequestDetails;
}

export async function uploadRequest(binId: string, request: RequestDetails, context: ZuploContext) {
  const requestId = `req-${encodeURIComponent(new Date().toISOString())}-${context.requestId}`;
  const r2Response = await aws.fetch(`${R2_BUCKET_URL}/${binId}/${requestId}.json`, {
    method: "PUT",
    body: JSON.stringify(request),
  });


  return;
}