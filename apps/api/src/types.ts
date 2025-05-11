export type CreateDidResponse = {
  did: string;
  controllerKeyId: string;
};

export type CredentialIssueResponse = {
  '@context': string[];
  credentialSubject: {
    id: string; // did:key:<uuid>
    // ?: name: string;
  };
  credentialStatus: object;
  issuanceDate: string; // ISO 8601 date-time
  issuer: {
    id: string;
  };
  proof: {
    jwt: string;
    type: string;
  };
  type: string[];
};

export type CredentialVerifyResponse = {
  verified: boolean;
  policies: {
    credentialStatus: boolean;
  };
  issuer: string;
  signer: {
    id: string;
    type: string;
    controller: string;
    publicKeyMultibase: string;
  };
};
