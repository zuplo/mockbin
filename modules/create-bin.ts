import { ZuploContext, ZuploRequest } from "@zuplo/runtime";

interface PostBody {
  response: {
    status: number,
    statusText?: string,
    headers?: Record<string, string>,
    body?: string
  }
}

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