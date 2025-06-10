import { config } from '../../src/config';
import { sendMessage } from '../../src/messaging';
import { pageCredentials } from '../../src/storage';
import './style.css';

const { CRDBL_REGEX } = config;

// Function to verify crdbls on the page
async function verifyPageCrdbls(url: string) {
  const verifyTextCrdbls = async () => {
    // Walk text nodes to collect crdbls
    const crdbls = new Set<string>();
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT
    );
    for (let n: Node | null = walker.nextNode(); n; n = walker.nextNode()) {
      const txt = n.textContent!;
      for (const [, id] of txt.matchAll(CRDBL_REGEX)) crdbls.add(id);
    }
    if (crdbls.size === 0) return crdbls;

    // Ask the background worker for verification status of crdbls
    const verified = await sendMessage('getCrdblVerification', [...crdbls]);

    // Annotate crdbl verification snippets in-place
    walker.currentNode = document.body;
    const textNodes: Text[] = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode())
      textNodes.push(n as Text);

    for (const n of textNodes) {
      const parts = n.textContent!.split(CRDBL_REGEX);
      if (parts.length < 3) continue;

      const frag = document.createDocumentFragment();
      for (let i = 0; i < parts.length - 1; i += 2) {
        frag.append(parts[i]);
        const id = parts[i + 1];
        const span = document.createElement('span');
        span.textContent = `crdbl:${id}`;
        if (verified[id]) span.className = 'crdbl-checked';
        else span.className = 'crdbl-warning';
        frag.append(span);
      }
      frag.append(parts[parts.length - 1]);
      n.parentNode!.replaceChild(frag, n);
    }

    return crdbls;
  };

  // Verify crdbls in HTML data-crdbl attributes
  const verifyDataCrdbls = async () => {
    const crdbls = new Set<string>();
    const elems = document.querySelectorAll('[data-crdbl]');

    elems.forEach((el) => {
      const id = el.getAttribute('data-crdbl');
      if (id) crdbls.add(id);
    });

    if (crdbls.size === 0) return crdbls;

    const verified = await sendMessage('getCrdblVerification', [...crdbls]);

    elems.forEach((el) => {
      const id = el.getAttribute('data-crdbl');
      if (!id) return;
      el.classList.add(verified[id] ? 'crdbl-checked' : 'crdbl-warning');
      el.setAttribute('title', `crdbl:${id}`);
    });

    return crdbls;
  };

  const pageCrdbls = new Set([
    ...(await verifyTextCrdbls()),
    ...(await verifyDataCrdbls()),
  ]);

  if (pageCrdbls.size > 0) {
    // Update page credentials in storage once with all found crdbls
    const currentCreds = (await pageCredentials.getValue()) || {};
    currentCreds[url] = [...pageCrdbls];
    await pageCredentials.setValue(currentCreds);
  }

  return pageCrdbls;
}

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',

  async main(ctx) {
    // Initial verification
    await verifyPageCrdbls(window.location.href);

    // Listen for URL changes in SPAs and/or websites using HTML5 history mode
    // https://wxt.dev/guide/essentials/content-scripts.html#dealing-with-spas
    ctx.addEventListener(window, 'wxt:locationchange', async ({ newUrl }) => {
      // Clear previous page's crdbls from storage
      const currentCreds = (await pageCredentials.getValue()) || {};
      delete currentCreds[newUrl.toString()];
      await pageCredentials.setValue(currentCreds);

      // Run verification for the new URL
      await verifyPageCrdbls(newUrl.toString());
    });
  },
});
