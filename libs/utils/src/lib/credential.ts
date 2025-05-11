import * as ed from '@noble/ed25519';
import { base58btc } from 'multiformats/bases/base58';

export async function createHolderDid() {
  const priv = ed.utils.randomPrivateKey();
  const pub = await ed.getPublicKeyAsync(priv);

  const prefixed = new Uint8Array(2 + pub.length);
  prefixed.set([0xed, 0x01]); // multicodec: Ed25519‑pub
  prefixed.set(pub, 2);
  const didKey = `did:key:z${base58btc.encode(prefixed)}`;

  return didKey;
}
