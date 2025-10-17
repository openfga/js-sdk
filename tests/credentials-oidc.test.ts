import * as nock from 'nock';
import { OpenFgaClient, UserClientConfigurationParams } from '..';
import { CredentialsMethod } from '../credentials';
import { baseConfig } from './helpers/default-config';

describe('OIDC Token Path Handling', () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  const testOidcConfig = (apiTokenIssuer: string, expectedTokenUrl: string) => {
    const config: UserClientConfigurationParams = {
      ...baseConfig,
      credentials: {
        method: CredentialsMethod.ClientCredentials,
        config: {
          clientId: 'test-client',
          clientSecret: 'test-secret',
          apiTokenIssuer,
          apiAudience: 'https://api.fga.example'
        }
      }
    };

    // Parse the expected URL to get base URL and path
    const parsedUrl = new URL(expectedTokenUrl);
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
    const path = parsedUrl.pathname;

    // Mock the token endpoint
    const tokenScope = nock(baseUrl)
      .post(path)
      .reply(200, {
        access_token: 'test-token',
        expires_in: 300
      });

    // Mock the FGA API call
    const apiScope = nock('https://api.fga.example')
      .post(`/stores/${baseConfig.storeId}/check`)
      .reply(200, { allowed: true });

    return { config, tokenScope, apiScope };
  };

  it('should append /oauth/token when no path is provided', async () => {
    const { config, tokenScope, apiScope } = testOidcConfig(
      'auth.example.com',
      'https://auth.example.com/oauth/token'
    );

    const client = new OpenFgaClient(config);
    await client.check({
      user: 'user:test',
      relation: 'reader',
      object: 'document:test'
    });

    expect(tokenScope.isDone()).toBe(true);
    expect(apiScope.isDone()).toBe(true);
  });

  it('should respect custom token paths', async () => {
    const { config, tokenScope, apiScope } = testOidcConfig(
      'auth.example.com/oauth/v2/token',
      'https://auth.example.com/oauth/v2/token'
    );

    const client = new OpenFgaClient(config);
    await client.check({
      user: 'user:test',
      relation: 'reader',
      object: 'document:test'
    });

    expect(tokenScope.isDone()).toBe(true);
    expect(apiScope.isDone()).toBe(true);
  });

  it('should handle full URLs with custom paths', async () => {
    const { config, tokenScope, apiScope } = testOidcConfig(
      'https://auth.example.com/oauth/v2/token',
      'https://auth.example.com/oauth/v2/token'
    );

    const client = new OpenFgaClient(config);
    await client.check({
      user: 'user:test',
      relation: 'reader',
      object: 'document:test'
    });

    expect(tokenScope.isDone()).toBe(true);
    expect(apiScope.isDone()).toBe(true);
  });

  it('should handle paths with trailing slashes', async () => {
    const { config, tokenScope, apiScope } = testOidcConfig(
      'auth.example.com/oauth/v2/',
      'https://auth.example.com/oauth/v2'
    );

    const client = new OpenFgaClient(config);
    await client.check({
      user: 'user:test',
      relation: 'reader',
      object: 'document:test'
    });

    expect(tokenScope.isDone()).toBe(true);
    expect(apiScope.isDone()).toBe(true);
  });

  it('should handle root path correctly', async () => {
    const { config, tokenScope, apiScope } = testOidcConfig(
      'auth.example.com/',
      'https://auth.example.com/oauth/token'
    );

    const client = new OpenFgaClient(config);
    await client.check({
      user: 'user:test',
      relation: 'reader',
      object: 'document:test'
    });

    expect(tokenScope.isDone()).toBe(true);
    expect(apiScope.isDone()).toBe(true);
  });

  it('should work with Zitadel-style paths (/oauth/v2/token)', async () => {
    const { config, tokenScope, apiScope } = testOidcConfig(
      'https://auth.zitadel.example/oauth/v2/token',
      'https://auth.zitadel.example/oauth/v2/token'
    );

    const client = new OpenFgaClient(config);
    await client.check({
      user: 'user:test',
      relation: 'reader',
      object: 'document:test'
    });

    expect(tokenScope.isDone()).toBe(true);
    expect(apiScope.isDone()).toBe(true);
  });

  it('should work with Entra ID/Azure AD style paths', async () => {
    const { config, tokenScope, apiScope } = testOidcConfig(
      'https://login.microsoftonline.com/tenant-id/oauth2/v2.0/token',
      'https://login.microsoftonline.com/tenant-id/oauth2/v2.0/token'
    );

    const client = new OpenFgaClient(config);
    await client.check({
      user: 'user:test',
      relation: 'reader',
      object: 'document:test'
    });

    expect(tokenScope.isDone()).toBe(true);
    expect(apiScope.isDone()).toBe(true);
  });
});