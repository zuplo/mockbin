import { environment, ZuploContext, ZuploRequest } from "@zuplo/runtime";

export default async function (
  request: ZuploRequest,
  context: ZuploContext,
  options: never,
  policyName: string
) {

  if (environment.MOCK_MODE === "true") {
    return await context.invokeInboundPolicy("mock-api-inbound", request);
  }

  return request;
}
