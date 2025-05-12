import {
  createHolderDid,
  signWithHolderDid,
  verifyHolderDid,
} from './credential.js';

describe('credential utils', () => {
  it('can create a did, sign, and verify', async () => {
    const { did, privateKey } = await createHolderDid();
    const content = 'hello world';
    const signature = await signWithHolderDid(privateKey, content);
    const valid = await verifyHolderDid(did, content, signature);
    expect(valid).toBe(true);
    // Tampered content should fail
    const invalid = await verifyHolderDid(did, 'goodbye world', signature);
    expect(invalid).toBe(false);
  });
});
