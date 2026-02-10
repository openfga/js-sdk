import globalAxios, { AxiosInstance } from "axios";
import * as http from "http";
import * as https from "https";

import { Configuration, UserConfigurationParams } from "./configuration";
import { Credentials } from "./credentials";

const DEFAULT_CONNECTION_TIMEOUT_IN_MS = 10000;

/**
 *
 * @export
 * @interface RequestArgs
 */
export interface RequestArgs {
    url: string;
    options: any;
}

/**
 *
 * @export
 * @class BaseAPI
 */
export class BaseAPI {
  protected configuration: Configuration;
  protected credentials: Credentials;

  constructor(configuration: UserConfigurationParams | Configuration, protected axios?: AxiosInstance) {
    if (configuration instanceof Configuration) {
      this.configuration = configuration;
    } else {
      this.configuration = new Configuration(configuration);
    }
    this.configuration.isValid();

    this.credentials = Credentials.init(this.configuration, this.axios);

    if (!this.axios) {
      const httpAgent = new http.Agent({ keepAlive: true });
      const httpsAgent = new https.Agent({ keepAlive: true });
      this.axios = globalAxios.create({
        httpAgent,
        httpsAgent,
        timeout: DEFAULT_CONNECTION_TIMEOUT_IN_MS,
        headers: this.configuration.baseOptions?.headers,
      });
    }
  }
}
