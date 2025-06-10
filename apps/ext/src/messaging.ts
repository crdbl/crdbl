import { CrdblCredential } from '@crdbl/utils';
import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
  getCrdblData(uuids: string[]): {
    [k: string]: CrdblCredential | null;
  };

  getCrdblVerification(uuids: string[]): {
    [k: string]: boolean;
  };

  urlChanged(data: { tabId: number; tabUrl: string }): void;
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
