import { HttpResponse } from "@smithy/protocol-http";
import { buildQueryString } from "@smithy/querystring-builder";

export class NoCacheFetchHttpHandler {
  destroy() {}

  updateHttpClientConfig() {}

  httpHandlerConfigs() {
    return {};
  }

  async handle(request: any, { abortSignal }: { abortSignal?: AbortSignal } = {}) {
    if (abortSignal?.aborted) {
      const abortError = new Error("Request aborted");
      abortError.name = "AbortError";
      throw abortError;
    }

    let path = request.path;
    const queryString = buildQueryString(request.query || {});
    if (queryString) {
      path += `?${queryString}`;
    }
    if (request.fragment) {
      path += `#${request.fragment}`;
    }

    let auth = "";
    if (request.username != null || request.password != null) {
      const username = request.username ?? "";
      const password = request.password ?? "";
      auth = `${username}:${password}@`;
    }

    const url = `${request.protocol}//${auth}${request.hostname}${request.port ? `:${request.port}` : ""}${path}`;
    const body =
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : request.body;

    const requestOptions: RequestInit & { duplex?: "half" } = {
      body,
      headers: new Headers(request.headers),
      method: request.method,
      signal: abortSignal,
    };

    if (body) {
      requestOptions.duplex = "half";
    }

    const response = await fetch(url, requestOptions);
    const transformedHeaders: Record<string, string> = {};
    for (const [key, value] of response.headers.entries()) {
      transformedHeaders[key] = value;
    }

    return {
      response: new HttpResponse({
        headers: transformedHeaders,
        reason: response.statusText,
        statusCode: response.status,
        body: response.body ?? (await response.blob()),
      }),
    };
  }
}
