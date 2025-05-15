import { CrdblCredentialAttributes } from '@crdbl/utils';

export type CreateDidResponse = {
  did: string;
  controllerKeyId: string;
};

export type CredentialSubject = { id: string } & CrdblCredentialAttributes;

export type CredentialIssueResponse = {
  '@context': string[];
  credentialSubject: CredentialSubject;
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
