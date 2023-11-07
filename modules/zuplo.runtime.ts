import {
  DataDogLoggingPlugin,
  RuntimeExtensions,
  ZuploRequest,
  environment,
} from "@zuplo/runtime";

export function runtimeInit(runtime: RuntimeExtensions) {
  if (environment.DATADOG_API_KEY) {
    runtime.addPlugin(
      new DataDogLoggingPlugin({
        url: "https://http-intake.logs.datadoghq.com/api/v2/logs",
        apiKey: environment.DATADOG_API_KEY,
      }),
    );
  }

  // This rewrites the URL of the request when the service is hosted
  // with wildcard subdomains by taking the binId from the subdomain and
  // adding it to the path. This way this app works for both hosting options
  runtime.addRequestHook(async (request, context) => {
    const url = new URL(request.url);
    const parts = url.hostname.split(".");
    // {binId}.api.mockbin.io
    if (parts.length === 4) {
      // Remove the binId from the hostname
      url.hostname = url.hostname.substring(parts[0].length + 1);
      // Add the binId to the path
      url.pathname = `/${parts[0]}${url.pathname}`;
    }

    context.log.info(`Rewriting URL`, {
      incoming: request.url,
      rewritten: url.toString(),
    });
    const newRequest = new ZuploRequest(url.toString(), request);
    return newRequest;
  });
}
