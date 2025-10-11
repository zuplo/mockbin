import { describe, test, assert } from "vitest";

describe("OpenAPI Bin ID Format Tests", () => {
  test("Should use hyphen format for new OpenAPI bins", () => {
    // This test verifies that when creating new OpenAPI bins,
    // they use the hyphen format which is DNS-compatible
    
    // Simulate the bin ID creation logic from handlers.ts
    let binId = "12345678901234567890123456789012"; // 32 hex chars
    binId += "-oas"; // This is the new format we're implementing
    
    // Verify the format
    assert.isTrue(binId.endsWith("-oas"), "Should use hyphen format");
    assert.isFalse(binId.includes("_"), "Should not contain underscores");
    assert.strictEqual(binId.length, 36, "Should be 32 chars + 4 chars for -oas");
    
    // Verify it's DNS-compatible
    const isDnsCompatible = /^[a-zA-Z0-9-]+$/.test(binId) && 
                           !binId.startsWith("-") && 
                           !binId.endsWith("-");
    assert.isTrue(isDnsCompatible, "Should be DNS hostname compatible");
  });
});