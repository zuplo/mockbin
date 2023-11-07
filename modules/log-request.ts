import { HttpProblems, ZuploContext, ZuploRequest } from "@zuplo/runtime";
import { BASE_TIME } from "./env";
import { storageClient } from "./storage";
import { RequestData } from "./types";
import { getBinFromUrl, validateBinId } from "./utils";

export default async function (request: ZuploRequest, context: ZuploContext) {
  const url = new URL(request.url);
  const urlInfo = getBinFromUrl(url);
  if (!urlInfo) {
    return HttpProblems.badRequest(request, context, {
      detail: "No binId specified in request",
    });
  }
  const { binId, pathname } = urlInfo;

  if (validateBinId(binId)) {
    return HttpProblems.badRequest(request, context);
  }

  const headers: Record<string, string> = {};
  for (const [key, value] of request.headers) {
    if (!key.startsWith("cf-")) {
      headers[key] = value;
    }
  }

  const requestId = `req-${BASE_TIME - Date.now()}-${
    request.method
  }-${context.requestId.replaceAll("-", "")}`;

  const storage = storageClient(context.log);

  const body = request.body ? await request.text() : null;
  const size = body ? new TextEncoder().encode(JSON.stringify(body)).length : 0;
  const req: RequestData = {
    method: request.method,
    headers,
    size,
    url: {
      pathname,
      search: url.search,
    },
    body,
  };

  context.waitUntil(
    storage.uploadObject(`${binId}/${requestId}.json`, JSON.stringify(req)),
  );

  return request;
}
