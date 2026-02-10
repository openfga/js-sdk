## Node.js Support Policy for OpenFGA JS SDK

The OpenFGA JavaScript SDK follows [Node.js release policy](https://nodejs.org/en/about/previous-releases) and supports all versions currently in **LTS** or **Maintenance** mode.

### Currently Supported Versions

| Node.js Version | Upstream Support Status | Tested in CI/CD Pipelines |
|:----------------|:------------------------|:-------------------------:|
| **18**          | EoL                     |         Yes* [1]          |
| **20**          | Maintenance             |            Yes            |
| **22**          | Maintenance             |            Yes            |
| **24**          | LTS                     |            Yes            |
| **25**          | Current                 |            Yes            |

[1]: While we maintain best-effort compatibility with Node.js v18 for now, we recommend updating to a Node.js version that is [officially supported upstream](https://nodejs.org/en/about/previous-releases).

### Support Details

#### Best-Effort Support

We will make a best effort to maintain compatibility with Node.js versions that have reached End-of-Life (EOL), but **we will not test** against them in our CI/CD pipelines. This means you may be able to use the JS SDK with older versions of Node.js, but you may not be able to run tests (because many of our testing dependencies have dropped support for EOL versions).

#### Testing

We actively test the JS SDK against all currently supported Node.js versions (20, 22, 24, and 25) in our CI/CD pipelines.

#### Long-term plan

This best-effort support will not continue indefinitely. We plan to modernize our JS SDK, adopt more functionality now native to the language, and add support for alternate runtimes such as Deno, Cloudflare Workers, and Vercel Edge.


