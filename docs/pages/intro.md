---
title: Mockbin by Zuplo
description: Open-source API mocking — create a bin, send requests, inspect everything.
---

# Mockbin by Zuplo

**Mockbin** is an open-source, fully-free tool that lets you spin up a fixed-response API endpoint and inspect every request sent to it. Useful for:

- Wiring up a frontend before the real backend exists.
- Testing webhook payloads without a server.
- Reproducing a bug with a known fake response.
- Mocking an entire OpenAPI document in seconds.

## Why Mockbin

- **No sign-up.** Create a bin and start sending requests.
- **Inspect everything.** Every request is captured — method, headers, body, size, timestamp.
- **OpenAPI-aware.** Upload an OpenAPI 3.1 document and Mockbin will mock it from your schemas and examples.
- **Open source.** [Source on GitHub](https://github.com/zuplo/mockbin) — MIT-licensed, contributions welcome.

## How it works

1. Create a bin at [mockbin.io](https://mockbin.io). You get a unique URL.
2. Send any HTTP request to that URL. Mockbin returns the response you configured.
3. View incoming requests in the bin detail page — live, no refresh required.

Built on [Zuplo](https://zuplo.com) and Cloudflare R2. The API specification lives under [API reference](/api).
