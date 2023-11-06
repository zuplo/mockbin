import {
  DataDogLoggingPlugin,
  RuntimeExtensions,
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
}
