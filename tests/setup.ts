import * as nock from "nock";

// Prevent any unmocked HTTP request from silently leaking to the real network.
// Without this, a missing nock (e.g. for a retry attempt) will be sent over the
// wire, fail asynchronously, and get laundered into a generic FgaError after
// retry backoffs - which is exactly how the original broken 429 retry test
// went undetected for so long. Failing fast and loudly is much better.
nock.disableNetConnect();

afterAll(() => {
  nock.enableNetConnect();
  nock.restore();
});