"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nock_1 = __importDefault(require("nock"));
const node_test_1 = require("node:test");
const OPENFGA_API_URL_HOST = "api.fga.example";
(0, node_test_1.beforeEach)(() => {
    nock_1.default.disableNetConnect();
    nock_1.default.enableNetConnect((host) => host.startsWith(OPENFGA_API_URL_HOST));
});
(0, node_test_1.afterEach)(() => {
    const pendingMocks = nock_1.default.pendingMocks();
    nock_1.default.cleanAll();
    if (pendingMocks.length > 0) {
        throw new Error(`Pending Nock mocks found: ${pendingMocks.join(",")}`);
    }
});
//# sourceMappingURL=setup.js.map