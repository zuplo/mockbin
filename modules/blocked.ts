import { HttpProblems, ZuploContext, ZuploRequest } from "@zuplo/runtime";
import { getBinFromUrl } from "./utils";

const BLOCKED_BINS = ["d99caaa8ed794063a917411904c65e87"];

export default async function (request: ZuploRequest, context: ZuploContext) {
  const url = new URL(request.url);
  const urlInfo = getBinFromUrl(url);
  if (!urlInfo) {
    return HttpProblems.badRequest(request, context, {
      detail: "No binId specified in request",
    });
  }
  const { binId } = urlInfo;

  if (BLOCKED_BINS.includes(binId)) {
    return HttpProblems.forbidden(request, context, {
      detail: "This bin is blocked due to abuse.",
    });
  }
}
