import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
  getCrdblVerification(uuids: string[]): {
    [k: string]: boolean;
  };
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
