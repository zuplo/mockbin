import { MockServer } from "../modules/mock-server"; // Adjust the path as needed
import { describe, test, assert } from "vitest";
import json from "./pizza.oas.json";

// OpenAPI document
const mockServer = new MockServer(json);

describe("MockServer Tests for Pizza API", () => {
  // Validation Tests
  describe("Validation Tests", () => {
    const path = "http://localhost/pizza/order";

    test("Should return 400 when missing required query parameter", async () => {
      const url = `http://localhost/pizza/order/3`;
      const request = new Request(url, {
        method: "GET",
        headers: {
          banana: "123.23",
        },
      });

      const response = await mockServer.handleRequest(request);
      assert.strictEqual(response.status, 400);
      const responseBody = await response.json();
      assert.deepStrictEqual(responseBody, {
        type: "https://httpproblems.com/http-status/400",
        title: "Bad Request",
        status: 400,
        detail: "Invalid parameters",
        errors: ["Missing required query parameter 'filter'"],
      });
    });

    test("Should return 400 when query parameter has incorrect type", async () => {
      const url = `http://localhost/pizza/order/3?filter=bob`;
      const request = new Request(url, {
        method: "GET",
      });

      const response = await mockServer.handleRequest(request);
      assert.strictEqual(response.status, 400);
      const responseBody: any = await response.json();
      assert.strictEqual(
        responseBody.errors[0],
        "Expected type 'integer' at path 'filter', but got 'string'",
      );
    });

    test("Should return 400 when missing required fields in request body", async () => {
      const requestBody = {
        size: "Medium",
        // Missing required fields
      };
      const request = new Request(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      const response = await mockServer.handleRequest(request);
      assert.strictEqual(response.status, 400);
      const responseBody: any = await response.json();
      assert.strictEqual(responseBody.status, 400);
      assert.ok(
        responseBody.errors.includes("Missing required field 'customerName'"),
      );
      assert.ok(
        responseBody.errors.includes("Missing required field 'pizzaType'"),
      );
      assert.ok(
        responseBody.errors.includes(
          "Missing required field 'deliveryAddress'",
        ),
      );
    });

    test("Should return 400 when request body has incorrect types", async () => {
      const requestBody = {
        customerName: "John Doe",
        pizzaType: 2,
        size: "Large",
        toppings: ["Mushrooms", "Olives"],
        deliveryAddress: "123 Pizza St, Pizzatown",
      };
      const request = new Request(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      const response = await mockServer.handleRequest(request);
      assert.strictEqual(response.status, 400);
      const responseBody: any = await response.json();
      assert.strictEqual(responseBody.status, 400);
      assert.ok(
        responseBody.errors.includes(
          "Expected type 'string' at path 'pizzaType', but got 'number'",
        ),
      );
    });

    // In the Validation Tests section

    test("Should return 400 when missing required header parameter", async () => {
      const request = new Request("http://localhost/pizza/order/3", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const response = await mockServer.handleRequest(request);
      assert.strictEqual(response.status, 400);
      const responseBody = (await response.json()) as any;
      assert.ok(
        responseBody.errors.includes(
          "Missing required header parameter 'banana'",
        ),
      );
    });

    test("Should return 400 when required header parameter is not a number", async () => {
      const request = new Request("http://localhost/pizza/order/3", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          banana: "not-a-number", // Invalid number
        },
      });
      const response = await mockServer.handleRequest(request);
      assert.strictEqual(response.status, 400);
      const responseBody = (await response.json()) as any;
      assert.ok(
        responseBody.errors.includes(
          "Expected type 'number' at path 'banana', but got 'string'",
        ),
      );
    });
  });

  // Mocking Tests
  describe("Mocking Tests", () => {
    const path = "http://localhost/pizza/order";

    test("Should return 200 with valid query parameter", async () => {
      const url = "http://localhost/pizza/menu";

      const request = new Request(url, {
        method: "GET",
      });

      const response = await mockServer.handleRequest(request);
      assert.strictEqual(response.status, 200);
      const responseBody = await response.json();
      assert.ok(responseBody);
      // Further assertions can be made based on expected response structure
    });

    test("Should return 200 when query parameter has correct type", async () => {
      const url = `http://localhost/pizza/order/3?filter=123`;
      const request = new Request(url, {
        method: "GET",
        headers: {
          banana: "78",
        },
      });

      const response = await mockServer.handleRequest(request);
      assert.strictEqual(response.status, 200);
    });

    test("Should return 200 and generate deep body from schema", async () => {
      const url = `http://localhost/foo`;
      const request = new Request(url, {
        method: "GET",
      });

      const response = await mockServer.handleRequest(request);
      assert.strictEqual(response.status, 200);
      const responseBody = await response.json();
      assert.deepStrictEqual(responseBody, {
        bar: {
          wibble: {
            foo: [0],
          },
        },
      });
    });

    test("Should return 201 with valid request body", async () => {
      const requestBody = {
        customerName: "John Doe",
        pizzaType: "Margherita",
        size: "Large",
        toppings: ["Mushrooms", "Olives"],
        deliveryAddress: "123 Pizza St, Pizzatown",
      };
      const request = new Request(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      const response = await mockServer.handleRequest(request);
      const responseBody = await response.json();
      assert.strictEqual(response.status, 201);
      assert.ok(responseBody);
      // Further assertions based on expected response structure
    });

    test("Should return 201 when posting order without Content-Type header", async () => {
      const requestBody = {
        customerName: "Jane Smith",
        pizzaType: "Pepperoni",
        size: "Medium",
        toppings: ["Peppers", "Onions"],
        deliveryAddress: "456 Pizza Ave, Pizzaville",
      };
      const request = new Request(path, {
        method: "POST",
        // No Content-Type header
        body: JSON.stringify(requestBody),
      });
      const response = await mockServer.handleRequest(request);
      console.log(await response.clone().text());
      assert.strictEqual(response.status, 201);
      const responseBody = await response.json();
      assert.ok(responseBody);
      // Further assertions based on expected response structure
    });

    test("Should return 200 with XML response from /xml", async () => {
      const url = "http://localhost/xml";

      const request = new Request(url, {
        method: "GET",
        headers: {
          Accept: "application/xml",
        },
      });

      const response = await mockServer.handleRequest(request);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.headers.get("Content-Type"),
        "application/xml",
      );
      const responseBody = await response.text();
      assert.ok(responseBody.includes("<note>"));
      // Further assertions can be made based on expected XML content
    });

    test("Should return 200 with plain text response from /text", async () => {
      const url = "http://localhost/text";

      const request = new Request(url, {
        method: "GET",
        headers: {
          Accept: "text/plain",
        },
      });

      const response = await mockServer.handleRequest(request);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.headers.get("Content-Type"), "text/plain");
      const responseBody = await response.text();
      assert.strictEqual(
        responseBody.trim(),
        "This is a plain text response example.",
      );
    });

    test("Should return 200 with JSON response from /multi-type when Accept is application/json", async () => {
      const url = "http://localhost/multi-type";

      const request = new Request(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const response = await mockServer.handleRequest(request);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.headers.get("Content-Type"),
        "application/json",
      );
      const responseBody = (await response.json()) as any;
      assert.strictEqual(
        responseBody.message,
        "This is a JSON response example.",
      );
    });

    test("Should return 200 with XML response from /multi-type when Accept is application/xml", async () => {
      const url = "http://localhost/multi-type";

      const request = new Request(url, {
        method: "GET",
        headers: {
          accept: "application/xml",
        },
      });

      const response = await mockServer.handleRequest(request);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.headers.get("Content-Type"),
        "application/xml",
      );
      const responseBody = await response.text();
      assert.ok(responseBody.includes("<response>"));
    });

    test("Should return 200 with default response from /multi-type when no Accept header is provided", async () => {
      const url = "http://localhost/multi-type";

      const request = new Request(url, {
        method: "GET",
        // No Accept header
      });

      const response = await mockServer.handleRequest(request);
      assert.strictEqual(response.status, 200);
      const contentType = response.headers.get("Content-Type");
      assert.strictEqual(contentType, "application/json");
      const responseBody = await response.text();
      assert.ok(responseBody);
      // Further assertions can be made based on the default content type and response
    });
  });

  // Error Tests
  describe("Error Tests", () => {
    test("Should return 500 with no mockable information", async () => {
      const request = new Request("http://localhost/no-mock-available", {
        method: "GET",
      });
      const response = await mockServer.handleRequest(request);
      assert.strictEqual(response.status, 500);
      const responseBody = (await response.json()) as any;
      assert.strictEqual(
        responseBody.detail,
        "Unable to Mock. No mockable information found for this path.",
      );
    });

    test("Should return 404 if no endpoint", async () => {
      const request = new Request("http://localhost/nope", {
        method: "GET",
      });
      const response = await mockServer.handleRequest(request);
      assert.strictEqual(response.status, 404);
    });
  });
});
