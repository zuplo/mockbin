import { assert, describe, test } from "vitest";
import {
  describeAccept,
  matchesAccept,
  parseAccept,
} from "../www/utils/fileAccept";

const fileOf = (name: string, type = "") => new File(["{}"], name, { type });

describe("parseAccept", () => {
  test("splits, trims and lowercases entries", () => {
    assert.deepEqual(parseAccept(".JSON, .yaml ,.yml"), [
      ".json",
      ".yaml",
      ".yml",
    ]);
  });

  test("drops empty entries", () => {
    assert.deepEqual(parseAccept(".json,,"), [".json"]);
  });
});

describe("matchesAccept", () => {
  const extensions = parseAccept(".json,.yaml,.yml");

  test("accepts a file with an accepted extension", () => {
    assert.isTrue(matchesAccept(fileOf("pizza.oas.yaml"), extensions));
  });

  test("accepts regardless of extension case", () => {
    assert.isTrue(matchesAccept(fileOf("Maven-API.JSON"), extensions));
  });

  test("rejects a file with an unaccepted extension", () => {
    assert.isFalse(
      matchesAccept(fileOf("notes.txt", "text/plain"), extensions),
    );
  });

  test("matches an exact MIME type against the file's type", () => {
    const entries = parseAccept("application/json");
    assert.isTrue(
      matchesAccept(fileOf("schema.json", "application/json"), entries),
    );
    assert.isFalse(matchesAccept(fileOf("notes.txt", "text/plain"), entries));
  });

  test("matches a wildcard MIME type against the file's type", () => {
    const entries = parseAccept("text/*");
    assert.isTrue(matchesAccept(fileOf("notes.txt", "text/plain"), entries));
    assert.isTrue(matchesAccept(fileOf("api.yaml", "text/yaml"), entries));
    assert.isFalse(matchesAccept(fileOf("logo.png", "image/png"), entries));
  });

  test("mixes extensions and MIME types", () => {
    const entries = parseAccept(".yaml,application/json");
    assert.isTrue(matchesAccept(fileOf("api.yaml"), entries));
    assert.isTrue(matchesAccept(fileOf("api", "application/json"), entries));
    assert.isFalse(matchesAccept(fileOf("logo.png", "image/png"), entries));
  });

  test("accepts everything when the list is empty", () => {
    assert.isTrue(matchesAccept(fileOf("anything.exe"), parseAccept("")));
  });
});

describe("describeAccept", () => {
  test("phrases an extension-only list as suffixes", () => {
    assert.equal(
      describeAccept(parseAccept(".json,.yaml")),
      "ending in .json, .yaml",
    );
  });

  test("phrases a MIME-only list as types", () => {
    assert.equal(
      describeAccept(parseAccept("application/json,text/*")),
      "of type application/json, text/*",
    );
  });

  test("phrases a mixed list without claiming either", () => {
    assert.equal(
      describeAccept(parseAccept(".yaml,application/json")),
      "matching .yaml, application/json",
    );
  });
});
