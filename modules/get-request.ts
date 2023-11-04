import { ZuploContext, ZuploRequest } from "@zuplo/runtime";

interface GetRequestResponse {
  timestamp: "string",
  method: string,
  headers: Record<string, string>,
  body: string
}

async function GetRequestDetails(binId: string, requestId: string): Promise<GetRequestResponse> {
  return {} as GetRequestResponse;
}

export default async function (request: ZuploRequest, context: ZuploContext) {
  const binId = request.params.binId;
  const requestId = request.params.requestId;

  const data = await GetRequestDetails(binId, requestId);
  return data;
}