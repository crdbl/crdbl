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
