import { BinResponse, GetRequestResponse, GetRequestsResponse } from "./types";

export async function uploadFile(name: string, content: string) {
  // todo implement this thing
  return;
}

export async function listFiles(binId: string): Promise<GetRequestsResponse> {
  // todo implement this
  return { data: [] };
}

export async function getResponse(binId: string): Promise<BinResponse> {
  return { "response": { "status": 200 } };
}

export async function getRequestDetails(binId: string, requestId: string): Promise<GetRequestResponse> {
  return {} as GetRequestResponse;
}