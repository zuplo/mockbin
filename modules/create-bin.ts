import { ZuploContext, ZuploRequest } from "@zuplo/runtime";
import { uploadResponse } from "./file-utils";

export default async function (request: ZuploRequest, context: ZuploContext) {
  const binId = crypto.randomUUID();
  const content = await request.json();
  await uploadResponse(binId, content);
  const response = {
    id: binId,
    url: `${binId}.api.mockbin.io`
  }
  return new Response(JSON.stringify(response, null, 2), {
    status: 201,
    statusText: "Created"
  });
}