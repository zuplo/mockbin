import {
  ApiCheck,
  ApiCheckProps,
  Assertion,
  AssertionBuilder,
  CheckGroup,
  HttpRequestMethod,
} from "checkly/constructs";

export interface ApiCheckRequest extends Omit<RequestInit, "body"> {
  url: string;
  body?: string;
}

export interface ApiCheckOptions extends Omit<ApiCheckProps, "request"> {
  logicalId?: string;
  request: ApiCheckRequest;
  assertions?: Assertion[];
}

export const asserts = () => AssertionBuilder;

export function createCheck(options: ApiCheckOptions) {
  const { request, assertions, ...opts } = options;

  if (!request.url.startsWith("/")) {
    throw new Error("URL must be relative and start with a '/' character.");
  }

  const headers: { key: string; value: string }[] = [];
  for (const [key, value] of Object.entries(request.headers ?? {})) {
    headers.push({ key, value });
  }

  const parsedUrl = new URL(request.url, "https://example.com");
  const url = options.group
    ? `{{GROUP_BASE_URL}}${parsedUrl.pathname}`
    : `{{ENVIRONMENT_URL}}${parsedUrl.pathname}`;
  const queryParameters: { key: string; value: string }[] = Array.from(
    parsedUrl.searchParams.entries(),
  ).map(([key, value]) => ({ key, value }));

  const id = opts.name
    .toLocaleLowerCase()
    .replaceAll(" ", "-")
    .replace(/[^a-zA-Z0-9-]/g, "");
  const logicalId = options.group ? `${options.group.logicalId}-${id}` : id;

  return new ApiCheck(logicalId, {
    ...opts,
    request: {
      url,
      queryParameters,
      method: (request.method ?? "GET") as HttpRequestMethod,
      headers,
      body: request.body,
      assertions,
    },
  });
}

export function groupedCheck(group: CheckGroup) {
  return (props: Omit<ApiCheckOptions, "group">) =>
    createCheck({ ...props, group });
}
