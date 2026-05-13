<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./docs/public/logo-dark.svg">
    <img alt="Mockbin by Zuplo" src="./docs/public/logo-light.svg" width="220">
  </picture>
</div>

<div align="center">
  <h1>Mockbin by Zuplo</h1>
  <a href="https://twitter.com/zuplo">
    <img alt="Follow @zuplo on X" src="https://img.shields.io/twitter/follow/zuplo">
  </a>
  <p>
    <a href="#usage"><strong>Usage</strong></a> ·
    <a href="#about"><strong>About</strong></a> ·
    <a href="#how-it-works"><strong>How it works</strong></a>
  </p>
</div>

Spin up a custom endpoint to test HTTP requests, inspect every inbound call, and (optionally) mock an entire OpenAPI document in seconds. No sign-up, no cost.

## Usage

Visit [mockbin.io](https://mockbin.io), create a bin, and start sending requests to your new endpoint.

Send any HTTP method to the URL you get back:

```bash
curl -X POST https://api.mockbin.io/<bin-id> \
  -H "Content-Type: application/json" \
  -d '{"hello":"world"}'
```

Then watch incoming requests live from the bin detail page.

## About

At Zuplo we were big fans of [mockbin.org](https://mockbin.org) and used it for testing APIs and doing demos. Unfortunately, it was shut down.

In the spirit of being scrappy and shipping quickly, a group of us built a replacement as an impromptu hackathon project on a weekend — and we shipped with love ❤️ and a bit of coffee ☕️.

### How it works

The API is built with [Zuplo](https://zuplo.com) and stores bin data in Cloudflare's [R2](https://www.cloudflare.com/developer-platform/r2/) (or any S3-compatible storage).

The frontend is a Next.js app under [`www/`](./www) deployable on Vercel or anywhere else you prefer.

The developer portal (API reference + guides) is built with [Zudoku](https://zudoku.dev) and lives in [`docs/`](./docs). It deploys alongside the API via `zup deploy`.

#### Running the docs locally

```bash
npm install
npm run docs:dev
```

# License

[MIT License](./LICENSE)
