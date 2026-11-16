# Using an HTTP Proxy and Custom CA Certificates

The SDK sends requests with the runtime's native `fetch`, so proxy and TLS settings are configured on the runtime rather than through SDK options. This page covers running behind a corporate proxy, including one that re-signs TLS traffic with a private certificate authority (CA).

## Trusting a private CA

If requests fail with errors such as `unable to get local issuer certificate` or `self-signed certificate in certificate chain`, Node.js does not trust the CA that signed the certificate it was shown. Do **not** disable certificate validation (`NODE_TLS_REJECT_UNAUTHORIZED=0`). Instead, add your CA to the trusted set by pointing `NODE_EXTRA_CA_CERTS` at a PEM file that contains it:

```bash
NODE_EXTRA_CA_CERTS=/path/to/corporate-ca.pem node app.js
```

The variable is read once at process start, so it must be set in the environment before Node.js launches.

## Using a proxy

### Option 1: Environment variables (Node.js 24+, or 22.21+)

Set `NODE_USE_ENV_PROXY=1` and Node.js will honor `HTTP_PROXY`, `HTTPS_PROXY` and `NO_PROXY` for `fetch`, with no code changes:

```bash
NODE_USE_ENV_PROXY=1 \
HTTPS_PROXY=http://user:password@proxy.example.com:3128 \
NO_PROXY=localhost,127.0.0.1 \
NODE_EXTRA_CA_CERTS=/path/to/corporate-ca.pem \
node app.js
```

Setting `HTTP_PROXY`/`HTTPS_PROXY` alone has no effect on `fetch` unless `NODE_USE_ENV_PROXY=1` (or the `--use-env-proxy` flag) is also set.

### Option 2: A custom `fetch` with an `undici` `ProxyAgent`

On older Node.js versions, or when you want the proxy to apply only to the OpenFGA client, pass a custom `fetch` through the [`HttpClient`](../README.md#custom-http-client) argument. Install [`undici`](https://www.npmjs.com/package/undici) and attach a `ProxyAgent` as the request `dispatcher`:

```javascript
const { OpenFgaClient } = require('@openfga/sdk');
const { ProxyAgent, fetch: undiciFetch } = require('undici');
const fs = require('node:fs');

const dispatcher = new ProxyAgent({
  uri: 'http://proxy.example.com:3128',
  // token: `Basic ${Buffer.from('user:password').toString('base64')}`, // proxy credentials, if required
  // Trust the CA that signs the certificate of the OpenFGA server (or of your TLS-inspecting proxy).
  requestTls: { ca: fs.readFileSync('/path/to/corporate-ca.pem') },
  // proxyTls: { ca: ... }, // only needed if the proxy itself is reached over HTTPS
});

const fgaClient = new OpenFgaClient(
  {
    apiUrl: process.env.FGA_API_URL,
    storeId: process.env.FGA_STORE_ID,
  },
  {
    fetch: (url, init) => undiciFetch(url, { ...init, dispatcher }),
  }
);
```

Notes:

- `ca` replaces Node.js's default trusted roots for connections made through this agent. To keep them, pass `ca: [...require('node:tls').rootCertificates, fs.readFileSync('/path/to/corporate-ca.pem')]`.
- Use `undici`'s own `fetch`, as shown, so that the `dispatcher` option is guaranteed to be compatible with the `undici` version you installed.
- The same `fetch` is used for the OAuth2 token request when using the client credentials flow, so the proxy applies to those calls too.
