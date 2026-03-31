import { Configuration, UserConfigurationParams } from "./configuration";
import { HttpClient } from "./common";
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
  protected httpClient: HttpClient;

  constructor(configuration: UserConfigurationParams | Configuration, httpClient?: HttpClient) {
    if (configuration instanceof Configuration) {
      this.configuration = configuration;
    } else {
      this.configuration = new Configuration(configuration);
    }
    this.configuration.isValid();

    this.httpClient = httpClient ?? {
      fetch: globalThis.fetch.bind(globalThis),
      defaultTimeout: DEFAULT_CONNECTION_TIMEOUT_IN_MS,
      defaultHeaders: this.configuration.baseOptions?.headers,
    };

    this.credentials = Credentials.init(this.configuration, this.httpClient);
  }
}
