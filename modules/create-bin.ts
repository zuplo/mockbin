import { ZuploContext, ZuploRequest } from "@zuplo/runtime";

async function uploadFile(name: string, content: string) {
  // todo implement this thing
  return;
}

export default async function (request: ZuploRequest, context: ZuploContext) {
  const binId = crypto.randomUUID();
  const content = await request.text();
  await uploadFile(`${binId}.json`, content);
  return {
    id: binId
  }
}