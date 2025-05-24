import { storage } from '#imports';

// local storage for the holder DID
export const holderDid = storage.defineItem<{
  did: string;
  privateKey: string;
}>('local:holderDid');

// local storage item for selected text
export const selectedText = storage.defineItem<string>('local:selectedText');
