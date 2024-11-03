export const json = {
  openapi: "3.0.0",
  info: {
    title: "Pizza Ordering API",
    description:
      "An API to order pizzas, check order status, and view menu options",
    version: "1.0.0",
  },
  paths: {
    "/pizza/order": {
      post: {
        summary: "Place a pizza order",
        operationId: "placeOrder",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/OrderRequest",
              },
              examples: {
                orderExample: {
                  summary: "Example order",
                  value: {
                    customerName: "John Doe",
                    pizzaType: "Margherita",
                    size: "Large",
                    toppings: ["Mushrooms", "Olives"],
                    deliveryAddress: "123 Pizza St, Pizzatown",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Order successfully placed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/OrderResponse",
                },
                examples: {
                  orderResponseExample: {
                    summary: "Order Response Example",
                    value: {
                      orderId: "abc123",
                      estimatedDeliveryTime: "45 minutes",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/pizza/order/{orderId}": {
      get: {
        summary: "Check the status of an existing order",
        operationId: "checkOrderStatus",
        parameters: [
          {
            name: "orderId",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "filter",
            in: "query",
            required: true,
            schema: {
              type: "integer",
            },
          },
          {
            name: "banana",
            in: "header",
            required: true,
            schema: {
              type: "number",
            },
          },
        ],
        responses: {
          "200": {
            description: "Order status retrieved",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/OrderStatusResponse",
                },
                examples: {
                  statusExample: {
                    summary: "Status example",
                    value: {
                      orderId: "abc123",
                      status: "In the oven",
                      estimatedDeliveryTime: "20 minutes",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Order not found",
          },
        },
      },
    },
    "/pizza/menu": {
      get: {
        summary: "Get the available pizza menu",
        operationId: "getMenu",
        responses: {
          "200": {
            description: "Menu retrieved",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/MenuResponse",
                },
                examples: {
                  menuExample: {
                    summary: "Menu example",
                    value: {
                      pizzas: [
                        {
                          name: "Margherita",
                          sizes: ["Small", "Medium", "Large"],
                          toppings: ["Cheese", "Tomato"],
                        },
                        {
                          name: "Pepperoni",
                          sizes: ["Small", "Medium", "Large"],
                          toppings: ["Pepperoni", "Cheese", "Tomato"],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/v1/todos": {
      "x-zuplo-path": {
        pathMode: "open-api",
      },
      get: {
        summary: "Get all todos",
        description:
          "Lorem ipsum dolor sit amet, **consectetur adipiscing** elit, sed do `eiusmod tempor` incididunt ut labore et dolore magna aliqua.",
        "x-zuplo-route": {
          corsPolicy: "none",
          handler: {
            export: "urlRewriteHandler",
            module: "$import(@zuplo/runtime)",
            options: {
              rewritePattern: "https://jsonplaceholder.typicode.com/todos",
            },
          },
          policies: {
            inbound: ["api-key-inbound", "rate-limit-inbound"],
          },
        },
        operationId: "e48db9e6-b0df-444a-9059-08a5c81cc8eb",
      },
    },
    "/no-mock-available": {
      get: {
        summary: "Information about the pizza API",
        operationId: "noMockAvailable",
        responses: {
          "200": {
            description: "Information retrieved",
            content: {},
          },
        },
      },
    },
    "/foo": {
      get: {
        summary: "Retrieve the foo structure",
        operationId: "getFoo",
        responses: {
          "200": {
            description: "Foo structure retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    bar: {
                      type: "object",
                      properties: {
                        wibble: {
                          type: "object",
                          properties: {
                            foo: {
                              type: "array",
                              items: {
                                type: "integer",
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/xml": {
      get: {
        summary: "Get XML response",
        operationId: "getXmlResponse",
        responses: {
          "200": {
            description: "XML response",
            content: {
              "application/xml": {
                examples: {
                  xmlExample: {
                    summary: "XML Example",
                    value: `
<note>
  <to>User</to>
  <from>API</from>
  <heading>Reminder</heading>
  <body>This is an XML response example.</body>
</note>
                    `,
                  },
                },
              },
            },
          },
        },
      },
    },
    "/text": {
      get: {
        summary: "Get plain text response",
        operationId: "getTextResponse",
        responses: {
          "200": {
            description: "Plain text response",
            content: {
              "text/plain": {
                examples: {
                  textExample: {
                    summary: "Text Example",
                    value: "This is a plain text response example.",
                  },
                },
              },
            },
          },
        },
      },
    },
    "/multi-type": {
      get: {
        summary: "Get response with multiple content types",
        operationId: "getMultiTypeResponse",
        responses: {
          "200": {
            description: "Response with multiple content types",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                    },
                  },
                },
                examples: {
                  jsonExample: {
                    summary: "JSON Example",
                    value: {
                      message: "This is a JSON response example.",
                    },
                  },
                },
              },
              "application/xml": {
                examples: {
                  xmlExample: {
                    summary: "XML Example",
                    value: `
<response>
  <message>This is an XML response example.</message>
</response>
                    `,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      OrderRequest: {
        type: "object",
        properties: {
          customerName: {
            type: "string",
          },
          pizzaType: {
            type: "string",
          },
          size: {
            type: "string",
            enum: ["Small", "Medium", "Large"],
          },
          toppings: {
            type: "array",
            items: {
              type: "string",
            },
          },
          deliveryAddress: {
            $ref: "#/components/schemas/Address",
          },
        },
        required: ["customerName", "pizzaType", "size", "deliveryAddress"],
      },
      Address: {
        type: "string",
      },
      OrderResponse: {
        type: "object",
        properties: {
          orderId: {
            type: "string",
          },
          estimatedDeliveryTime: {
            type: "string",
          },
        },
      },
      OrderStatusResponse: {
        type: "object",
        properties: {
          orderId: {
            type: "string",
          },
          status: {
            type: "string",
          },
          estimatedDeliveryTime: {
            type: "string",
          },
        },
      },
      MenuResponse: {
        type: "object",
        properties: {
          pizzas: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
                sizes: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                toppings: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
