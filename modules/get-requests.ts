import { ZuploContext, ZuploRequest } from "@zuplo/runtime";


interface GetRequestsResponse {
  data: {
    "requestId": string
  }[]
}

async function listFiles(binId: string): Promise<GetRequestsResponse> {
  // todo implement this
  return { data: [] };
}

/**
 * /storage/{binId}.txt
 * /storage/{binId}/req-2023-11-01-01:04PM-POST-458dfkj.json
 * /storage/{binId}/req-2023-11-01-02:45PM-POST-458dfkj.json
 */

export default async function (request: ZuploRequest, context: ZuploContext) {
  const binId = request.params.binId;
  const files = await listFiles(binId);
  // TODO - what if no folder, should return a 404
  return files;
}