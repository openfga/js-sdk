"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAPI = void 0;
const axios_1 = __importDefault(require("axios"));
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const configuration_1 = require("./configuration");
const credentials_1 = require("./credentials");
const DEFAULT_CONNECTION_TIMEOUT_IN_MS = 10000;
/**
 *
 * @export
 * @class BaseAPI
 */
class BaseAPI {
    constructor(configuration, axios) {
        this.axios = axios;
        if (configuration instanceof configuration_1.Configuration) {
            this.configuration = configuration;
        }
        else {
            this.configuration = new configuration_1.Configuration(configuration);
        }
        this.configuration.isValid();
        this.credentials = credentials_1.Credentials.init(this.configuration, this.axios);
        if (!this.axios) {
            const httpAgent = new http.Agent({ keepAlive: true });
            const httpsAgent = new https.Agent({ keepAlive: true });
            this.axios = axios_1.default.create({
                httpAgent,
                httpsAgent,
                timeout: DEFAULT_CONNECTION_TIMEOUT_IN_MS,
                headers: this.configuration.baseOptions?.headers,
            });
        }
    }
}
exports.BaseAPI = BaseAPI;
//# sourceMappingURL=base.js.map