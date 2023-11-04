import { BinResponse, RequestDetails, RequestsResponse } from "./types";

export async function uploadResponse(binId: string, content: string) {
  // TODO 
  // 1. create a file with the name {binId}.json
  return;
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
  return { "response": { "status": 200 } };
}

export async function getRequest(binId: string, requestId: string): Promise<RequestDetails> {
  // TODO
  // 1. Get the JSON from the file at /{binId}/{requestId}.json
  // 2. If not found, return clear not found error so we can response 404 too
  return {} as RequestDetails;
}

export async function uploadRequest(binId: string, request: RequestDetails) {
  // TODO
  // 1. Take the request parameter and serialize to JSON
  // 2. Write to the /{binId} folder

  return;
}