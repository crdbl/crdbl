import { CrdblCredential, CredentialVerification } from '@crdbl/utils';
import { config } from '../src/config';
import { onMessage } from '../src/messaging';
import { selectedText } from '../src/storage';

// session cache of crdbl data and verification status
const cacheData = new Map<string, CrdblCredential | null>();
const cacheVerif = new Map<string, boolean>();

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  onMessage('getCrdblVerification', async (msg) => {
    const uuids = msg.data;

    // fetch verification results for those not in cache
    const unknown = uuids.filter((u: string) => !cacheVerif.has(u));
    if (unknown.length) {
      const pairs = await Promise.all(
        unknown.map(async (id: string) => {
          try {
            const r = await fetch(`${config.API_URL}/credential/verify/${id}`);
            if (!r.ok) throw new Error();
            const { verified } = (await r.json()) as CredentialVerification;
            return [id, verified] as const;
          } catch {
            return [id, false] as const;
          }
        })
      );
      pairs.forEach(([id, ok]) => cacheVerif.set(id, ok));
    }

    return Object.fromEntries(
      uuids.map((u: string) => [u, cacheVerif.get(u) ?? false])
    );
  });

  onMessage('getCrdblData', async (msg) => {
    const uuids = msg.data;

    // fetch credenntial details for those not in cache
    const unknown = uuids.filter((u: string) => !cacheData.has(u));
    if (unknown.length) {
      const pairs = await Promise.all(
        unknown.map(async (id: string) => {
          try {
            const r = await fetch(`${config.API_URL}/credential/${id}`);
            if (!r.ok) throw new Error();
            const data = (await r.json()) as CrdblCredential;
            return [id, data] as const;
          } catch {
            return [id, null] as const;
          }
        })
      );
      pairs.forEach(([id, data]) => cacheData.set(id, data));
    }

    return Object.fromEntries(
      uuids.map((u: string) => [u, cacheData.get(u) ?? null])
    );
  });

  // Add context menu items for side panel
  browser.contextMenus.create({
    id: 'open-sidepanel',
    title: 'Open side panel',
    contexts: ['action'],
  });
  browser.contextMenus.create({
    id: 'close-sidepanel',
    title: 'Close side panel',
    contexts: ['action'],
  });

  // Add context menu item for selected text
  browser.contextMenus.create({
    id: 'import-selected-text',
    title: 'Import Selected Text to Crdbl',
    contexts: ['selection'],
  });

  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab) return;

    if (info.menuItemId === 'open-sidepanel') {
      // Chrome MV3: sidePanel API
      if (browser.sidePanel && typeof browser.sidePanel.open === 'function') {
        await browser.sidePanel.open({ windowId: tab.windowId });
      }
      // Firefox: sidebarAction API (cast to any for cross-browser)
      else if (
        (browser as any).sidebarAction &&
        typeof (browser as any).sidebarAction.open === 'function'
      ) {
        await (browser as any).sidebarAction.open();
      }
    }

    if (info.menuItemId === 'close-sidepanel') {
      // Chrome MV3: sidePanel API
      if (
        browser.sidePanel &&
        typeof (browser.sidePanel as any).close === 'function'
      ) {
        await (browser.sidePanel as any).close({ windowId: tab.windowId });
      }
      // Firefox: sidebarAction API (cast to any for cross-browser)
      else if (
        (browser as any).sidebarAction &&
        typeof (browser as any).sidebarAction.close === 'function'
      ) {
        await (browser as any).sidebarAction.close();
      }
    }

    if (info.menuItemId === 'import-selected-text' && info.selectionText) {
      await selectedText.setValue(info.selectionText);

      // TODO: don't open the popup if sidepanel is open
      // Chrome/Edge popup
      if (browser.action?.openPopup) {
        await browser.action.openPopup();
        return;
      }

      // NOTE: for unknown reason, sidePanel.open not working here
      // Chrome sidepanel
      if (browser.sidePanel?.open) {
        await browser.sidePanel.open({ windowId: tab!.windowId });
        return;
      }

      // Firefox sidebar
      if ((browser as any).sidebarAction?.open) {
        await (browser as any).sidebarAction.open();
        return;
      }
    }
  });
});
