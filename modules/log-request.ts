import { ZuploContext, ZuploRequest } from "@zuplo/runtime";
import { uploadRequest } from "./file-utils";
import { RequestDetails } from "./types";

type MyPolicyOptionsType = {
  myOption: any;
};

export default async function (
  request: ZuploRequest,
  context: ZuploContext,
  options: MyPolicyOptionsType,
  policyName: string
) {
  // your policy code goes here, and can use the options to perform any
  // configuration
  // See the docs: https://www.zuplo.com/docs/policies/custom-code-inbound

  const clone = request.clone();

  const headers: Record<string, string> = {};

  for (const [key, value] of clone.headers) {
    headers[key] = value;
  }

  const req: RequestDetails = {
    timestamp: new Date().toISOString(),
    method: clone.method,
    headers,
    body: await clone.text()
  }

  void uploadRequest(request.params.binId, req, context).catch(e => {
    context.log.error(e);
  })


  return request;
}
