import { ZuploContext, ZuploRequest } from "@zuplo/runtime";
import { uploadResponse } from "./file-utils";

export default async function (request: ZuploRequest, context: ZuploContext) {
  const binId = crypto.randomUUID();
  const content = await request.text();
  await uploadResponse(binId, content);
  return {
    id: binId
  }
}