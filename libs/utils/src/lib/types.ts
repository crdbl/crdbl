export type CrdblCredentialAttributes = {
  alias?: string; // short code identifier
  content: string;
  context: string[]; // ids of reference crdbls
};

export type CrdblCredentialIssueRequest = {
  subjectDid: string;
  attributes: CrdblCredentialAttributes;
  signature: string;
  // crdbl-specific options
  opts?: {
    // default: false; iff true, generate short unique identifier
    generateAlias?: boolean;
  };
};

export type CreateDidResponse = {
  did: string;
  controllerKeyId: string;
};

export type CrdblCredentialSubject = { id: string } & CrdblCredentialAttributes;

export type CrdblCredential = {
  '@context': string[];
  credentialSubject: CrdblCredentialSubject;
  credentialStatus: object;
  issuanceDate: string; // ISO 8601 date-time
  issuer: {
    id: string;
  };
  id: string;
  proof: {
    jwt: string;
    type: string;
  };
  type: string[];
};

export type CredentialVerification = {
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
