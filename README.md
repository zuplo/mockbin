<div align="center">
<img alt="Mockbin by Zuplo logo" src="https://cdn.zuplo.com/assets/53e83603-7b0c-4d0c-af0e-5878c330c263.png">

</div>

<div align="center">
<h1>Mockbin by Zuplo</h1>
  <a href="https://twitter.com/zuplo">
    <img alt="X (formerly Twitter) Follow" src="https://img.shields.io/twitter/follow/zuplo">
  </a>
  <p align="center">
  <a href="#usage
  "><strong>Usage</strong></a> · 
  <a href="#about
  "><strong>About</strong></a> · 
   <a href="#how-it-works
  "><strong>How it works</strong></a>
</p>
</p>
</div>

Easily generate custom endpoints to test HTTP requests, and view the request logs from that API for free. Now with OpenAPI support; Mock your OpenAPI file in seconds.

## Usage

Visit https://mockbin.io, create a new bin, and start sending requests to your new endpoint!

![How mockbin works](./assets/mockbin.gif)

## About

At Zuplo we were big fans of [mockbin.org](https://mockbin.org) and used it for testing APIs and doing demos. Unfortunately, it was shut down.

In the spirit of being scrappy and shipping quickly, a group of us decided to build a replacement as an impromptu hackathon project on a weekend - and we shipped with love ❤️ and a bit of coffee ☕️.

### How it works

The API for this project is built using [Zuplo](https://zuplo.com) and Cloudflare's [R2](https://www.cloudflare.com/developer-platform/r2/) (or any S3 API compatible storage) for the backend.

The frontend is a simple Next.js app that can be deployed to Vercel or anywhere else you prefer.

# License

[MIT License](./LICENSE)
