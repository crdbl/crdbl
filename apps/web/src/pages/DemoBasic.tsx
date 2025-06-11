import { DemoLevel } from '../components/DemoLevel';
import { CrdblCard } from '../components/CrdblCard';

const crdbls = {
  T1: '9WpTBzRNGq',
  T2: 'wtNJTWRH68',
  T3: 'kDg8JNCwtq',
  T4: '6MQcbwhGpP',
  T5: 'XXXXXXXXXX',
};

const data = {
  T1: {
    title: 'Short-form post (tweet)',
    content: 'Just deployed the next revolution and open-sourced the core!',
    context: [],
    whyWorks: [
      "Content signed by @creator's Decentrilized Identifier",
      'Signature verified and credential issued by crdbl API',
      'The hash anchors authorship and proves the text is unaltered',
    ],
  },
  T2: {
    title: 'Long-form blog excerpt',
    content:
      'In this article I outline a three-step process for reproducible builds in embedded Linux …',
    context: [],
    whyWorks: [
      'Full article with content hash stored in credential → IPFS.',
      'More crdbls can be created referencing this one, only if not contradicting the source.',
    ],
  },
  T3: {
    title: 'Paper Excerpt: Biofilm Resistance',
    content:
      'Our meta-analysis of 42 randomized controlled trials shows quorum-sensing inhibitors reduce biofilm-related infection rates by 63% (p < 0.01).',
    context: [],
    whyWorks: [
      'Credential binds excerpt to the full article hash.',
      'Creator and timestamp included for citation-grade provenance.',
      'Signed by the corresponding author; timestamp matches journal submission.',
    ],
  },
  T4: {
    title: 'Quote: Digital IP Perspective',
    content:
      "In the digital age, protecting intellectual property isn't about building walls, it's about creating transparent trails of ownership that travel with the content itself.",
    context: [],
    whyWorks: [
      'Hash + signature travel with the quote across the web.',
      'Verification shows text integrity and author ownership.',
    ],
  },
  /*
  T5: {
    title: 'News Excerpt: City Water Crisis',
    content:
      "Internal memos obtained by *The Herald* reveal lead levels in Riverdale's municipal water exceeded federal limits for seven straight months in 2024.",
    type: 'News Article Excerpt',
    context: [],
    whyWorks: [
      'Credential links excerpt to full article and source documents.',
      'Signature from the newsroom's key ensures chain-of-custody integrity.',
    ],
  },
*/
  T5: {
    title: 'Uncredentialed Content',
    content: 'This content is not verifiably credible.',
    context: [],
    whyWorks: ["No verified credential, no crdbl'ity."],
  },
};

function getLabel(crdblId: string): string {
  const x = Object.entries(crdbls).find(([, id]) => id === crdblId)?.[0] || '';
  return x.replace('T', '');
}
function getRefData(ref: string) {
  return data[ref as keyof typeof data];
}

export function DemoBasic() {
  return (
    <DemoLevel
      title="Verifiable Content Examples"
      description="Each crdbl is a unit of content whose credential proves authorship anywhere on the web."
    >
      <CrdblCard
        title={data.T1.title}
        content={data.T1.content}
        whyWorks={data.T1.whyWorks}
        crdblId={crdbls.T1}
        label={getLabel(crdbls.T1)}
        getRefData={getRefData}
      />
      <CrdblCard
        title={data.T2.title}
        content={data.T2.content}
        whyWorks={data.T2.whyWorks}
        crdblId={crdbls.T2}
        label={getLabel(crdbls.T2)}
        getRefData={getRefData}
      />
      <CrdblCard
        title={data.T3.title}
        content={data.T3.content}
        whyWorks={data.T3.whyWorks}
        crdblId={crdbls.T3}
        label={getLabel(crdbls.T3)}
        getRefData={getRefData}
      />
      <CrdblCard
        title={data.T4.title}
        content={data.T4.content}
        whyWorks={data.T4.whyWorks}
        crdblId={crdbls.T4}
        label={getLabel(crdbls.T4)}
        getRefData={getRefData}
      />
      <CrdblCard
        title={data.T5.title}
        content={data.T5.content}
        whyWorks={data.T5.whyWorks}
        crdblId={crdbls.T5}
        label={getLabel(crdbls.T5)}
        getRefData={getRefData}
      />

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Embedding crdbls in Web Content</h2>
          <p className="text-base-content/80 mb-4">
            There are two ways to embed crdbls in your web content. The crdbl
            browser extension will automatically detect and verify both methods,
            showing a verification icon next to the content.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">1. HTML Attribute Method</h3>
              <div className="mockup-code bg-base-200">
                <pre>
                  &lt;span data-crdbl="xfJQRF9Jdr"&gt;This content is verifiably
                  credible.&lt;/span&gt;
                </pre>
              </div>
              <p className="text-sm text-base-content/70 mt-2">
                Best for semantic markup and accessibility. Works in any HTML
                context.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Text Reference Method</h3>
              <div className="mockup-code bg-base-200">
                <pre>This content is verifiably credible. crdbl:xfJQRF9Jdr</pre>
              </div>
              <p className="text-sm text-base-content/70 mt-2">
                Works in any plain text context, including markdown and plain
                text editors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DemoLevel>
  );
}
