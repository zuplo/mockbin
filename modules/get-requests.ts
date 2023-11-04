import { ZuploContext, ZuploRequest } from "@zuplo/runtime";
import { listRequests } from "./file-utils";

/**
 * /storage/{binId}.json
 * /storage/{binId}/req-2023-11-01-01:04PM-POST-458dfkj.json
 * /storage/{binId}/req-2023-11-01-02:45PM-POST-458dfkj.json
 */

export default async function (request: ZuploRequest, context: ZuploContext) {
  const binId = request.params.binId;
  const files = await listRequests(binId);
  // TODO - what if no folder, should return a 404
  return fi