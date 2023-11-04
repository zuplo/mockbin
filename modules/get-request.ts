import { ZuploContext, ZuploRequest } from "@zuplo/runtime";
import { getRequest } from "./file-utils";

export default async function (request: ZuploRequest, context: ZuploContext) {
  const binId = request.params.binId;
  const requestId = request.params.requestId;

  const data = await getRequest(binId, requestId);
  return data;
}