import * as ed from '@noble/ed25519';
import bs58 from 'bs58';

export type HolderDidResult = {
  did: string;
  privateKey: string;
  publicKey: string;
};

export async function createHolderDid(): Promise<HolderDidResult> {
  // Create Ed25519 keypair entirely in the browser
  const priv = ed.utils.randomPrivateKey();
  const pub = await ed.getPublicKeyAsync(priv);

  // Build a did:key – multicodec prefix 0xED01, then base58btc
  const prefixed = new Uint8Array(2 + pub.length);
  prefixed.set([0xed, 0x01]); // multicodec: Ed25519‑pub
  prefixed.set(pub, 2);
  const didKey = `did:key:z${bs58.encode(prefixed)}`;

  return {
    did: didKey,
    privateKey: ed.etc.bytesToHex(priv),
    publicKey: ed.etc.bytesToHex(pub),
  };
}
