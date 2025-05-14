import { storage } from '#imports';

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

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

  // Define a storage item for selected text
  const selectedText = storage.defineItem<string>('local:selectedText');

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
