import * as ed from '@noble/ed25519';
import bs58 from 'bs58';

export type HolderDidResult = {
  did: string;
  privateKey: string;
  publicKey: string;
};

/**
 * Return a shortened form of a DID (for display only).
 * @param did - The DID string to shorten
 * @returns string - The shortened DID
 */
export function shortenDid(did: string): string {
  if (did.length <= 24) return did;
  return `${did.slice(0, 16)}...${did.slice(-8)}`;
}

/**
 * Create a holder did:key.
 * @returns Promise<HolderDidResult> - The holder did:key, private key, and public key
 */
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

/**
 * Sign a string and context using the holder's private key (hex).
 * @param privateKeyHex - The private key in hex format
 * @param content - The string to sign
 * @param context - The context array to include in the signature
 * @returns Promise<string> - The signature as a hex string
 */
export async function signWithHolderDid(
  privateKeyHex: string,
  content: string,
  context: string[]
): Promise<string> {
  const priv = ed.etc.hexToBytes(privateKeyHex);
  const msg = new TextEncoder().encode(
    content + '\n' + JSON.stringify(context ?? [])
  );
  const sig = await ed.signAsync(msg, priv);
  return ed.etc.bytesToHex(sig);
}

/**
 * Verify a signature over a string and context using the public key from a did:key.
 * @param didKey - The did:key string (e.g., did:key:z...)
 * @param content - The string that was signed
 * @param context - The context array that was included in the signature
 * @param signatureHex - The signature as a hex string
 * @returns Promise<boolean> - True if valid, false otherwise
 */
export async function verifyHolderDid(
  didKey: string,
  content: string,
  context: string[],
  signatureHex: string
): Promise<boolean> {
  // Extract base58 public key from did:key
  const prefix = 'did:key:z';
  if (!didKey.startsWith(prefix)) throw new Error('Invalid did:key');
  const base58 = didKey.slice(prefix.length);
  const decoded = bs58.decode(base58);

  // Remove multicodec prefix (2 bytes)
  const pub = decoded.slice(2);
  const msg = new TextEncoder().encode(
    content + '\n' + JSON.stringify(context ?? [])
  );
  const sig = ed.etc.hexToBytes(signatureHex);

  if (pub.length !== 32)
    throw new Error(
      `Invalid public key length: ${pub.length}. Expected 32 bytes.`
    );

  if (sig.length !== 64)
    throw new Error(
      `Invalid signature length: ${sig.length}. Expected 64 bytes.`
    );

  return await ed.verifyAsync(sig, msg, pub);
}
