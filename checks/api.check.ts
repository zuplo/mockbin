import { asserts, check } from "./group";

check({
  name: "Should 200 requesting a mock",
  shouldFail: false,
  request: {
    url: `/`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  },
  assertions: [asserts().statusCode().equals(200)],
});
