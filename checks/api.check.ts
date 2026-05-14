import { ApiCheck, AssertionBuilder } from "checkly/constructs";
import { group } from "./group";

new ApiCheck("mockbin-should-200-requesting-a-mock", {
  name: "Should 200 requesting a mock",
  group,
  shouldFail: false,
  request: {
    url: "{{GROUP_BASE_URL}}/",
    method: "GET",
    headers: [{ key: "Content-Type", value: "application/json" }],
    assertions: [AssertionBuilder.statusCode().equals(200)],
  },
});
