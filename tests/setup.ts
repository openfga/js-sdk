import * as nock from "nock";

afterAll(() => {
    nock.restore();
});