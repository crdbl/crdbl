import { useState } from 'react';
import { CrdblCredential } from '@crdbl/utils';
import { config } from '../config';
import { sendMessage } from '../messaging';
import '../../entrypoints/verify.content/style.css';

// Component for displaying a credential and its IPFS content
export function CredentialListItem({
  cred,
  verified,
  instanceId = Math.random().toString(36).substring(7),
}: {
  cred: CrdblCredential;
  verified?: boolean;
  instanceId?: string;
}) {
  const title = cred.credentialSubject.alias || 'Credential';
  const issuanceDate = cred.issuanceDate || '';
  const details = { ...cred };
  if (details.proof && details.proof.jwt) {
    details.proof = { ...details.proof, jwt: '[hidden]' };
  }
  const cid = cred.credentialSubject.content;
  const contextIds = cred.credentialSubject.context || [];

  const [contextCreds, setContextCreds] = useState<
    Record<string, CrdblCredential | null>
  >({});
  const [contextVerif, setContextVerif] = useState<Record<string, boolean>>({});
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'content' | 'context' | 'credential'
  >('content');

  const verifClassname =
    verified === undefined ? '' : verified ? 'crdbl-checked' : 'crdbl-warning';

  // Load context credentials when the context tab is selected
  const loadContext = async () => {
    if (contextIds.length === 0 || Object.keys(contextCreds).length > 0) return;

    setIsLoadingContext(true);
    try {
      const verif = await sendMessage('getCrdblVerification', contextIds);
      setContextVerif(verif);

      const credData = await sendMessage('getCrdblData', contextIds);
      setContextCreds(credData);
    } catch (err) {
      console.error('Error loading context:', err);
    } finally {
      setIsLoadingContext(false);
    }
  };

  return (
    <div className="collapse collapse-arrow bg-base-100 shadow-xl ring-2 ring-base-content/10">
      <input type="checkbox" />
      <div className="collapse-title font-medium flex flex-col gap-1">
        <span className={`text-base font-semibold ${verifClassname}`}>
          {title}
        </span>
        {issuanceDate && (
          <span className="text-xs text-gray-500">
            Issued: {new Date(issuanceDate).toLocaleString()}
          </span>
        )}
      </div>
      <div className="collapse-content px-2">
        <div className="tabs tabs-lift">
          <input
            type="radio"
            name={`tabs_${instanceId}`}
            className="tab"
            aria-label="Content"
            checked={activeTab === 'content'}
            onChange={() => setActiveTab('content')}
          />
          <div className="tab-content bg-base-100 border-base-300">
            <div className="card-body p-2">
              {cid ? (
                <iframe
                  src={`${config.IPFS_URL}/${cid}`}
                  sandbox=""
                  referrerPolicy="no-referrer"
                  className="w-full min-h-[100px] max-h-[500px] rounded-xl bg-base-300"
                  title={`IPFS:${cid}`}
                  loading="lazy"
                  allow="clipboard-read; clipboard-write"
                />
              ) : (
                <span className="text-xs text-gray-400">
                  No IPFS content found.
                </span>
              )}
            </div>
          </div>

          {contextIds.length > 0 && (
            <>
              <input
                type="radio"
                name={`tabs_${instanceId}`}
                className="tab"
                aria-label="Context"
                checked={activeTab === 'context'}
                onChange={() => {
                  setActiveTab('context');
                  loadContext();
                }}
              />
              <div className="tab-content bg-base-100 border-base-300">
                <div className="card-body p-2">
                  {isLoadingContext ? (
                    <div className="flex justify-center items-center h-full">
                      <span className="loading loading-spinner loading-lg" />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {Object.entries(contextCreds)
                        .filter(([, cred]) => cred != null)
                        .map(([key, cred]) => (
                          <CredentialListItem
                            key={`${instanceId}-${key}`}
                            cred={cred!}
                            verified={contextVerif[key]}
                          />
                        ))}
                      {Object.entries(contextCreds)
                        .filter(([, cred]) => cred == null)
                        .map(([key]) => (
                          <div
                            key={`${instanceId}-${key}`}
                            className="text-xs text-gray-400"
                          >
                            Context credential not found: {key}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <input
            type="radio"
            name={`tabs_${instanceId}`}
            className="tab"
            aria-label="Credential"
            checked={activeTab === 'credential'}
            onChange={() => setActiveTab('credential')}
          />
          <div className="tab-content bg-base-100 border-base-300">
            <div className="card-body p-2">
              <pre className="text-xs text-left whitespace-pre-wrap break-all bg-base-300 p-2 rounded-xl">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
