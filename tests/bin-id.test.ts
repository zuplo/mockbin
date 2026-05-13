import { describe, test, assert, vi, beforeAll } from "vitest";

vi.mock("@zuplo/runtime", () => ({
  HttpProblems: {},
  ZuploContext: class {},
  ZuploRequest: class {},
}));
vi.mock("../modules/env", () => ({ USE_WILDCARD_SUBDOMAIN: false }));
vi.mock("../modules/storage", () => ({ StorageError: class {} }));

let validateBinId: (id: string) => boolean;
let isOasBin: (id: string) => boolean;

beforeAll(async () => {
  const utils = await import("../modules/utils");
  validateBinId = utils.validateBinId;
  isOasBin = utils.isOasBin;
});

describe("validateBinId", () => {
  test("accepts plain 32-hex bin id", () => {
    assert.isTrue(validateBinId("12345678901234567890123456789012"));
  });

  test("accepts new hyphen OAS suffix", () => {
    assert.isTrue(validateBinId("12345678901234567890123456789012-oas"));
  });

  test("accepts legacy underscore OAS suffix", () => {
    assert.isTrue(validateBinId("12345678901234567890123456789012_oas"));
  });

  test("rejects too-short id", () => {
    assert.isFalse(validateBinId("abc"));
  });

  test("rejects non-hex chars in id", () => {
    assert.isFalse(validateBinId("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"));
  });

  test("rejects unknown suffix", () => {
    assert.isFalse(validateBinId("12345678901234567890123456789012-foo"));
  });
});

describe("isOasBin", () => {
  test("detects new hyphen format", () => {
    assert.isTrue(isOasBin("12345678901234567890123456789012-oas"));
  });

  test("detects legacy underscore format", () => {
    assert.isTrue(isOasBin("12345678901234567890123456789012_oas"));
  });

  test("returns false for plain bin", () => {
    assert.isFalse(isOasBin("12345678901234567890123456789012"));
  });
});

describe("DNS hostname compliance", () => {
  test("new OAS bin id contains no underscores", () => {
    const binId = "12345678901234567890123456789012-oas";
    assert.isFalse(binId.includes("_"));
    assert.match(binId, /^[a-z0-9-]+$/);
  });
});
