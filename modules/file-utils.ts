import { BinResponse, RequestDetails, RequestsResponse } from "./types";

export async function uploadFile(name: string, content: string) {
  return;
}

export async function listFiles(binId: string): Promise<RequestsResponse> {
  return { data: [] };
}

export async function getResponse(binId: string): Promise<BinResponse> {
  return { "response": { "status": 200 } };
}

export async function getRequestDetails(binId: string, requestId: string): Promise<RequestDetails> {
  return {} as RequestDetails;
}

export async function uploadRequest(binId: string, request: RequestDetails) {


  return;
}