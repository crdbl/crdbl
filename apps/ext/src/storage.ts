import { storage } from '#imports';
import { config } from './config';

// local storage for the holder DID
export const holderDid = storage.defineItem<{
  did: string;
  privateKey: string;
}>('local:holderDid');

// local storage item for selected text
export const selectedText = storage.defineItem<string>('local:selectedText');

export type Theme = 'light' | 'dark';
export const settingsTheme = storage.defineItem<Theme>('sync:theme', {
  fallback: config.DEFAULT_THEME,
});
