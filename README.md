# Hookflare

A lightweight webhook forwarder and logger built with [Astro](https://astro.build) and Cloudflare. Hookflare lets you register temporary endpoints, forward incoming requests to your own server and inspect all traffic later.

## Features
- Create throwaway endpoints with a single API call.
- Forward requests to a target URL and return the upstream response.
- Log every request and response to Cloudflare D1.
- Browse recent requests from a simple logs page.

## Getting Started

### Prerequisites
- Node.js 18+
- A Cloudflare account with a KV namespace named `ENDPOINTS` and a D1 database named `LOGS`.

Apply the database schema:

```sh
wrangler d1 execute LOGS --file=./schema.sql
```

### Install & Run

```sh
npm install
npm run dev
```

This starts a local development server on `http://localhost:4321`. When using `wrangler pages dev`, ensure your KV namespace and D1 database are bound.

## Usage

### Register an endpoint

```sh
curl -X POST http://localhost:4321/register \
  -H 'content-type: application/json' \
  --data '{"url":"https://example.com/target"}'
```

The response returns the path to your new endpoint:

```json
{"endpoint":"/<id>"}
```

### Send requests through the endpoint

Any request sent to `/<id>` will be forwarded to the original URL. The request and response are stored for inspection.

### View logs
- Visit `http://localhost:4321/logs` for a basic UI.
- Query the API:

```sh
curl http://localhost:4321/api/logs?endpoint=<id>
```

## Building for Production

```sh
npm run build
```

Deploy the generated `dist/` to Cloudflare Pages with the same bindings for `ENDPOINTS` and `LOGS`.
