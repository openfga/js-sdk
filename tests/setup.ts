import { afterEach, beforeEach } from "node:test";
import nock from "nock";

const OPENFGA_API_URL_HOST = "api.fga.example";

beforeEach(() => {
  nock.disableNetConnect();
  nock.enableNetConnect((host) => host.startsWith(OPENFGA_API_URL_HOST));
});

afterEach(() => {
  const pendingMocks = nock.pendingMocks();
  nock.cleanAll();
  if (pendingMocks.length > 0) {
    throw new Error(`Pending Nock mocks found: ${pendingMocks.join(",")}`);
  }
});
