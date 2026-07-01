import nock from "nock";

// NOTE: Do not replace host constant with `OPENFGA_API_URL` import from `helpers/default-config`,
// as this very file imports `ClientConfiguration` class, and this in turn will invalidate
// jest's mock hoisting and break all telemetry tests.
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
