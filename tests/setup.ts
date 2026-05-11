import nock from "nock";

beforeEach(() => {
  nock.disableNetConnect();
});

afterEach(() => {
  const pendingMocks = nock.pendingMocks();
  nock.cleanAll();
  if (pendingMocks.length > 0) {
    throw new Error(`Pending Nock mocks found: ${pendingMocks.join(",")}`);
  }
});
