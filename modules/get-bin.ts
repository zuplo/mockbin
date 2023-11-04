import { ZuploContext, ZuploRequest } from "@zuplo/runtime";
import { getResponse } from "./file-utils";
export default async function (request: ZuploRequest, context: ZuploContext) {
  const binId = request.params.binId;
  context.log.info(`Getting bin ${binId}`)
  const data = await getResponse(binId);
  return data;
}