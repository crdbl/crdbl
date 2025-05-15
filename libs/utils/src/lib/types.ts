export type CrdblCredentialAttributes = {
  alias?: string; // short code identifier
  content: string;
  context: string[]; // ids of reference crdbls
};
