---
title: Usage
description: How to create and use a Mockbin endpoint.
---

# Usage

## Create a bin

`POST` a response definition to `https://api.mockbin.io/v1/bins`:

```bash
curl -X POST https://api.mockbin.io/v1/bins \
  -H "Content-Type: application/json" \
  -d '{
    "response": {
      "status": 200,
      "statusText": "OK",
      "headers": { "Content-Type": "application/json" },
      "body": "{\"hello\":\"world\"}"
    }
  }'
```

The response includes a unique `id` and `url` — the URL is your new mock endpoint.

## Call the bin

Send any HTTP method to the bin URL:

```bash
curl -X POST https://api.mockbin.io/<bin-id> \
  -H "Content-Type: application/json" \
  -d '{"hello":"world"}'
```

Mockbin returns the response you configured, and stores the inbound request.

## Inspect requests

Visit `https://mockbin.io/bins/<bin-id>` to see every request live.

## OpenAPI bins

`POST` an OpenAPI 3.1 document to `https://api.mockbin.io/v1/openapi/bins`:

```bash
curl -X POST https://api.mockbin.io/v1/openapi/bins \
  -F "file=@my-api.yaml"
```

Mockbin generates a mock from the spec's schemas and examples. Every operation in the spec becomes a callable endpoint.

## Full reference

The complete API surface lives under [API reference](/api).
