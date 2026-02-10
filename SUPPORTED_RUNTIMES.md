## Node.js Support Policy for OpenFGA JS SDK

The OpenFGA JavaScript SDK follows the upstream [Node.js release policy](https://nodejs.org/en/about/previous-releases). We support Node.js versions that are currently in **LTS** or **Maintenance** status.

### Currently Supported Versions

| Node.js Version | Upstream Support Status | Tested in CI/CD Pipelines |
|:----------------|:------------------------|:-------------------------:|
| **20**          | Maintenance             |            Yes            |
| **22**          | Maintenance             |            Yes            |
| **24**          | LTS                     |            Yes            |
| **25**          | Current                 |            Yes            |

### Support Details

#### Best-Effort Support

We will make a best effort to maintain compatibility with Node.js versions that have reached End-of-Life (EOL), but **we will not test** against them in our CI/CD pipelines. This means you may be able to use the JS SDK with older versions of Node.js (with yarn you can use the `--ignore-engines` flag), but you may not be able to run tests (because many of our testing dependencies have dropped support for EOL versions).

#### Long-term plan

This best-effort support will not continue indefinitely. We plan to modernize our JS SDK, adopt more functionality now native to the language, and add support for alternate runtimes such as Deno, Cloudflare Workers, and Vercel Edge.
