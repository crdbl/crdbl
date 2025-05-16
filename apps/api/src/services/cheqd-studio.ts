import { CHEQD_HEADERS, CHEQD_NETWORK, CHEQD_STUDIO_URL } from '../config.js';
import {
  CrdblCredential,
  CrdblCredentialAttributes,
  CreateDidResponse,
  CredentialVerification,
} from '@crdbl/utils';

export async function createDid() {
  const r = await fetch(`${CHEQD_STUDIO_URL}/did/create`, {
    method: 'POST',
    headers: CHEQD_HEADERS,
    body: JSON.stringify({
      network: CHEQD_NETWORK,
      identifierFormatType: 'uuid',
      assertionMethod: true, // want to sign credentials
      verificationMethodType: 'Ed25519VerificationKey2020',
    }),
  });
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()) as CreateDidResponse;
}

export async function issueCredential(x: {
  id?: string;
  issuerDid: string; // did:cheqd:<uuid>
  subjectDid: string; // did:key:<uuid>
  attributes: CrdblCredentialAttributes;
}) {
  const { id, issuerDid, subjectDid, attributes } = x;
  const r = await fetch(`${CHEQD_STUDIO_URL}/credential/issue`, {
    method: 'POST',
    headers: CHEQD_HEADERS,
    body: JSON.stringify({
      id,
      issuerDid,
      subjectDid,
      attributes,
      format: 'jwt',
    }),
  });
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()) as CrdblCredential;
}

export async function verifyCredential(jwt: string) {
  const r = await fetch(`${CHEQD_STUDIO_URL}/credential/verify`, {
    method: 'POST',
    headers: CHEQD_HEADERS,
    body: JSON.stringify({
      credential: jwt,
    }),
  });
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()) as CredentialVerification;
}
