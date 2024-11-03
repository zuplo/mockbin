import { HttpProblems, ZuploContext, ZuploRequest } from "@zuplo/runtime";
import { USE_WILDCARD_SUBDOMAIN } from "./env";
import { StorageError } from "./storage";

export function getProblemFromStorageError(
  err: unknown,
  request: ZuploRequest,
  context: ZuploContext,
  overrides?: { detail: string },
) {
  if (err instanceof StorageError) {
    if (err.status === 404) {
      return HttpProblems.notFound(request, context, overrides);
    } else {
      return HttpProblems.internalServerError(request, context, {
        detail: err.message,
        ...(overrides ?? {}),
      });
    }
  }
  return HttpProblems.internalServerError(request, context, overrides);
}

export function getBinFromUrl(
  url: URL,
): { binId: string; pathname: string } | undefined {
  const params = url.pathname.split("/");
  if (params.length === 0) {
    return undefined;
  }
  const binId = params[1];

  if (!binId) {
    return undefined;
  }

  return { binId, pathname: `/${params.slice(2).join("/")}` };
}

export function getInvokeBinUrl(url: URL, binId: string) {
  const mockUrl = new URL(
    USE_WILDCARD_SUBDOMAIN ? `https://${binId}.${url.hostname}` : url,
  );
  mockUrl.pathname = USE_WILDCARD_SUBDOMAIN ? "/" : `/${binId}`;
  return mockUrl;
}

const binRegEx = /^[0-9a-fA-F]{32}(_oas)?$/;

export function validateBinId(binId: string) {
  return binRegEx.test(binId);
}

export function validateOpenApiDocument(jsonString: string): void {

  // TODO - support YAML
  let document: any;

  // Attempt to parse the JSON string
  try {
    document = JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Invalid document - not JSON (YAML support coming soon - convert using https://jsonformatter.org/yaml-to-json for now`);
  }

  // Check if the document is an object
  if (typeof document !== "object" || document === null) {
    throw new Error("The JSON must represent an object.");
  }

  // Check for the 'openapi' field and its version
  if (typeof document.openapi !== "string" || !document.openapi.startsWith("3.")) {
    throw new Error("The document is not an OpenAPI 3.x specification.");
  }

  // Check for the 'info' field
  if (typeof document.info !== "object" || document.info === null) {
    throw new Error("The 'info' field is missing or invalid.");
  }

  // Check for the 'paths' field
  if (typeof document.paths !== "object" || document.paths === null) {
    throw new Error("The 'paths' field is missing or invalid.");
  }

  // Optionally, add more checks for other required fields if necessary
  // ...

  // If all checks pass
  console.log("The OpenAPI document appears to be valid.");
}

export function isOasBin(binId: string) {
  return binId.indexOf("_oas") > 0;
}

