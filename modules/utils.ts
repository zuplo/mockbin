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
