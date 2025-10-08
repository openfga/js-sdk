import { ClientConfiguration, UserClientConfigurationParams } from "../../client";
import { CredentialsMethod } from "../../credentials";

export const OPENFGA_STORE_ID = "01H0H015178Y2V4CX10C2KGHF4";
export const OPENFGA_MODEL_ID = "01HWBBMZTT7F1M97DVXQK4Z7J3";
export const OPENFGA_API_URL = "https://api.fga.example";
export const OPENFGA_API_TOKEN_ISSUER = "tokenissuer.fga.example";
export const OPENFGA_API_AUDIENCE = "https://api.fga.example/";
export const OPENFGA_CLIENT_ID = "01H0H3D8TD07EWAQHXY9BWJG3V";
export const OPENFGA_CLIENT_SECRET = "this-is-very-secret";
export const OPENFGA_API_TOKEN = "fga_abcdef";
export const OPENFGA_CLIENT_ASSERTION_SIGNING_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDmJ37Zi9/LS5/I
E5pl7XobscHSFNrTfZC9Jx15KF5iJLFb9s8twQdo/hWPC4adidu7gVCIGNGYBGH2
Q2z9nMrVA5TUQrrTsvJw0ldSWn2MeadZcMGI0AcaomOu8P7lxyaf/sgWAOgW1P+Y
SAEPHHvKuA0orQVVWYwt7jaaQ0GBwEh3XiwqiwUKCJQ06eeQVxXxGr9DBYtZJOzn
gLRj0wNF3WWU5JddV2o+CHRvpN1zLBHam3RXJQMdObs2waeR85AbfO6rNQr/Zscd
Y6XDsHjeAHOykfoMBBexK0Rdu3Vqk2DSaXG3HUC54sbCLZSDmo4S0Dsax1IEWnWs
rA8nD5O7AgMBAAECggEAWZzoNbFSJnhgEsmbNPO1t0HLq05Gc9FwwU2RGsMemM0b
p6ieO3zsszM3VraQqBds0IHFxvAO78dJE1dmgQsDKNSXptwCnXoQDuC/ckfcmY0m
nVsbZ/dDxNmUwaGBRht4TRSpeHPK6lTt3i+vBeC7zI9ERGG18WkH/TxC02a7g1aL
emz/SNgOdFkHPoKcgYyUp2Svh0aly9g2NbyIusNO4C9M/tCYRobcrZBRIognNZKY
bZVQrnilOClVcbND1oOPs0O6sxTMGd3eR7bS6w7i59vUCPwQSTo1L/FA23ZPY5kQ
AgeGZnp4Nve1Ecsvp48MJHb4cwJeysxH6hhyl3zMHQKBgQDzKmo1Sa5wAqTD4HAP
/aboYfSxhIE9c3qhj5HDP76PBZa8N5fyNyTJCsauk2a2/ZFOwCz142yF1JEbxHgb
j6XYYazVFfk2DFWb9Ul/zQMmCVcETlRhxIQPc76f9QjvAc20B6xeR3M14RwfK/u+
FaN7PsMAItH0xJRpGIWpwN/3PQKBgQDyTUY2WsGNUzMKarLyKX5KSDELfgmJtcAv
LunqhYnhks4i6PVknXIY4GuGhIhAanDFlFZIhTa5a2e2bNZvgRz+VxNNRsQQZPgt
M9Gg1fLSqQOL7OZn+cjkkYfxNE1FLMoStaANl6JkCjN4Ted2pLbswCBXwa4qsxRZ
bsA3BTWmVwKBgQCgqYSVAsLLZSPB+7dvCVPPNHF9HKRbmsIKnxZa3/IjAzlN0JmH
QuH+Jy2QyPlTrIPmeVj7ebEJV6Isq4oEA8w7BIYyIBuRl2K08cMHOsh6yC8DPFHK
axIqN3paq4akjBeCfJNpk2HO1pZDDkd9l0R1uMkUfO0mAQBh0/70YuhXrQKBgEbn
igZZ5I3grOz9cEQhFE3UdlWwmkXsI8Mq7VStoz2ZYi0hEr5QvJS/B3gjzGNdQobu
85jhMrRr07u0ecPDeqKLBKD2dmV9xoojwdJZCWfQAbOurXX7yGfqlmdlML9vbeqv
r5iKqQCxY4Ju+a7kYItDZbOIf9kK8oeBO0pegeadAoGAfYi3Sl3wYzaP44TKmjNq
3Z0NQChIcSzRDfEo25bioBzdlwf3tRBHTdPwdXhLJVTI/I90WMAcAgKaXlotrnMT
HultzBviGb7LdUt1cNnjS9C+Cl8tCYePUx+Wg+pQruYX3fAo27G0GlIC8CIQz79M
ElVV8gBIxYwuivacl3w9B6E=
-----END PRIVATE KEY-----`;

export const baseConfig: UserClientConfigurationParams = {
  storeId: OPENFGA_STORE_ID,
  authorizationModelId: OPENFGA_MODEL_ID,
  apiUrl: OPENFGA_API_URL,
  credentials: {
    method: CredentialsMethod.ClientCredentials,
    config: {
      apiTokenIssuer: OPENFGA_API_TOKEN_ISSUER,
      apiAudience: OPENFGA_API_AUDIENCE,
      clientId: OPENFGA_CLIENT_ID,
      clientSecret: OPENFGA_CLIENT_SECRET,
    }
  }
};

export const defaultConfiguration = new ClientConfiguration(baseConfig);
