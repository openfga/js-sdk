import * as nock from "nock";

beforeEach(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.restore();
});