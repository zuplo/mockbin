import { ZuploContext, ZuploRequest } from "@zuplo/runtime";
import { uploadFile } from "./file-utils";

export default async function (request: ZuploRequest, context: ZuploContext) {
  const binId = crypto.randomUUID();
  const content = await request.text();
  await uploadFile(`${binId}.json`, content);
  return {
    id: binId
  }
}