import { ZuploContext, ZuploRequest } from "@zuplo/runtime";
import { getResponse } from "./file-utils";

export default async function (request: ZuploRequest, context: ZuploContext) {
  const binId = request.params.binId;
  const binResponse = await getResponse(binId);
  const response = new Response(binResponse.body, {
    headers: binResponse.headers,
    status: binResponse.status,
    statusText: binResponse.statusText
  });
  return response;
}