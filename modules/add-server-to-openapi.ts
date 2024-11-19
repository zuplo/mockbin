import { ZuploContext, ZuploRequest } from "@zuplo/runtime";
import { getInvokeBinUrl, isOasBin } from "./utils";

// Module-level function to add invokeBinUrl to the OpenAPI document
function addInvokeBinUrlToOpenApiDoc(openApiDoc, invokeBinUrl) {
  // Ensure the 'servers' section exists
  if (!openApiDoc.servers) {
    openApiDoc.servers = [];
  }
  // Add the invokeBinUrl as the first server
  openApiDoc.servers.unshift({ url: invokeBinUrl });
  return openApiDoc;
}

export default async function policy(
  response: Response,
  request: ZuploRequest,
  context: ZuploContext,
  options: never,
  policyName: string
) {
  const binId = request.params.binId;
  const url = new URL(request.url);
  const invokeBinUrl = getInvokeBinUrl(url, binId);

  if (isOasBin(binId)) {
    const openApiDoc = await response.json();

    // Add the invokeBinUrl as the first server to the openApiDoc
    const newOpenApiDoc = addInvokeBinUrlToOpenApiDoc(openApiDoc, invokeBinUrl);
    return new Response(JSON.stringify(newOpenApiDoc, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return response;
}
