import { storage } from '#imports';
import { config } from './config';
import { Settings } from './settings';

// local storage for the holder DID
export const holderDid = storage.defineItem<{
  did: string;
  privateKey: string;
}>('local:holderDid');

// local storage item for selected text
export const selectedText = storage.defineItem<string>('local:selectedText');

// local storage item for user settings, synced across entrypoints
export const settingsItem = storage.defineItem<Settings>('sync:settings', {
  fallback: config.DEFAULT_SETTINGS,
});

// local storage for page credentials
export const pageCredentials = storage.defineItem<{
  [url: string]: string[]; // Map of page URLs to credential IDs found on that page
}>('local:pageCredentials');
