import { config } from '../../src/config';
import { sendMessage } from '../../src/messaging';
import './style.css';

const { CRDBL_REGEX } = config;

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',

  async main() {
    const verifyCrdbls = async () => {
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
      if (crdbls.size === 0) return;

      // Ask the background worker for verification status of crdbls
      const verified = await sendMessage('getCrdblVerification', [...crdbls]);
      console.log('verified', verified);

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
    };

    await verifyCrdbls();
  },
});
