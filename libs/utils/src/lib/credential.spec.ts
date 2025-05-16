import {
  createHolderDid,
  signWithHolderDid,
  verifyHolderDid,
} from './credential.js';

describe('credential utils', () => {
  it('can create a did, sign, and verify', async () => {
    const { did, privateKey } = await createHolderDid();
    const content = 'hello world';
    const context: string[] = [];
    const signature = await signWithHolderDid(privateKey, content, context);
    const valid = await verifyHolderDid(did, content, context, signature);
    expect(valid).toBe(true);
    // Tampered content should fail
    const invalid = await verifyHolderDid(did, 'goodbye world', context, signature);
    expect(invalid).toBe(false);
  });

  it('can create a did, sign, and verify with content and context', async () => {
    const { did, privateKey } = await createHolderDid();
    const content = 'hello world';
    const context = ['ctx1', 'ctx2'];
    const signature = await signWithHolderDid(privateKey, content, context);
    const valid = await verifyHolderDid(did, content, context, signature);
    expect(valid).toBe(true);
    // Tampered content should fail
    const invalidContent = await verifyHolderDid(did, 'goodbye world', context, signature);
    expect(invalidContent).toBe(false);
    // Tampered context should fail
    const invalidContext = await verifyHolderDid(did, content, ['ctx3'], signature);
    expect(invalidContext).toBe(false);
  });
});
