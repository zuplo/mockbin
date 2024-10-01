import { HttpProblems, ZuploContext, ZuploRequest } from "@zuplo/runtime";
import { getBinFromUrl } from "./utils";

const BLOCKED_BINS = ["d99caaa8ed794063a917411904c65e87"];

export default async function (request: ZuploRequest, context: ZuploContext) {
  let binId: string | undefined;
  if (request.params.binId) {
    binId = request.params.binId;
  } else {
    const url = new URL(request.url);
    const urlInfo = getBinFromUrl(url);
    if (!urlInfo) {
      return HttpProblems.badRequest(request, context, {
        detail: "No binId specified in request",
      });
    }
    binId = urlInfo.binId;
  }

  if (BLOCKED_BINS.includes(binId)) {
    return HttpProblems.forbidden(request, context, {
      detail: "This bin is blocked due to abuse.",
    });
  }

  return request;
}
