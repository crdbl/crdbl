import { useState, useEffect } from 'react';
import crdblLogo from '@/assets/crdbl.svg';
import {
  CrdblCredential,
  CrdblCredentialIssueRequest,
  createHolderDid,
  signWithHolderDid,
} from '@crdbl/utils';
import { storage } from '#imports';
import { config } from '../../src/config';
import './App.css';

// local storage for the holder DID
const holderDid = storage.defineItem<{
  did: string;
  privateKey: string;
}>('local:holderDid');

// local storage item for selected text
const selectedText = storage.defineItem<string>('local:selectedText');

function App() {
  const [did, setDid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'ok' | 'error' | 'checking'>(
    'checking'
  );
  const [credentialContent, setCredentialContent] = useState('');
  const [credentialContext, setCredentialContext] = useState('');
  const [credentials, setCredentials] = useState<CrdblCredential[]>([]);
  const [isIssuing, setIsIssuing] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${config.API_URL}/health`);
        setApiStatus(response.ok ? 'ok' : 'error');
      } catch (err) {
        void err; // make eslint happy
        setApiStatus('error');
      }
    };

    checkHealth();
  }, []);

  useEffect(() => {
    const checkExistingDid = async () => {
      try {
        const stored = await holderDid.getValue();
        if (stored) setDid(stored.did);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to check existing DID'
        );
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingDid();
  }, []);

  const handleCreateDid = async () => {
    try {
      setIsLoading(true);
      const { did, privateKey } = await createHolderDid();

      // Store DID and private key using WXT storage
      await holderDid.setValue({
        did,
        privateKey,
      });

      setDid(did);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create DID');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch credentials for the current DID
  const fetchCredentials = async (holderDid: string) => {
    try {
      const res = await fetch(`${config.API_URL}/credential/list/${holderDid}`);
      if (!res.ok) throw new Error('Failed to fetch credentials');
      const data = (await res.json()) as CrdblCredential[];
      setCredentials(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch credentials'
      );
    }
  };

  // Fetch credentials on mount and when DID changes
  useEffect(() => {
    if (did) fetchCredentials(did);
  }, [did]);

  // On mount, check and watch for selected text in storage
  useEffect(() => {
    selectedText.getValue().then((val) => {
      if (val) setCredentialContent(val);
    });

    const unwatch = selectedText.watch((val) => {
      if (val) setCredentialContent(val);
    });

    // cleanup
    return () => {
      unwatch();
    };
  }, []);

  // Handler for credential issuance
  const handleIssueCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsIssuing(true);
    setError(null);
    try {
      const stored = await holderDid.getValue();
      if (!stored) throw new Error('No holder DID found');

      const context = credentialContext
        .trim()
        .split(/[\s,]+/)
        .filter(Boolean); // remove ''

      const signature = await signWithHolderDid(
        stored.privateKey,
        credentialContent,
        context
      );

      const req: CrdblCredentialIssueRequest = {
        subjectDid: stored.did,
        attributes: {
          content: credentialContent,
          context,
        },
        signature,
        opts: {
          generateAlias: true,
        },
      };
      const res = await fetch(`${config.API_URL}/credential/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      if (!res.ok) throw new Error(await res.text());

      setCredentialContent('');
      setCredentialContext('');
      // Clear selected text from storage
      selectedText.removeValue();
      // Refresh credentials list
      fetchCredentials(stored.did);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to issue credential'
      );
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center">
        <img src={crdblLogo} className="logo" alt="Crdbl logo" />
        <div className="prose">
          <h1>crdbl</h1>
        </div>
      </div>

      {/* API Status Indicator */}
      <div className="bg-base-200 border-base-300 rounded-box w-full border p-2 mt-4">
        <div className="flex justify-center items-center gap-2">
          <span>API Status:</span>
          <div
            className={`w-3 h-3 rounded-full ${
              apiStatus === 'ok'
                ? 'bg-success'
                : apiStatus === 'error'
                ? 'bg-error'
                : 'bg-warning'
            }`}
          />
          <span>
            {apiStatus === 'ok'
              ? 'Connected'
              : apiStatus === 'error'
              ? 'Disconnected'
              : 'Checking...'}
          </span>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mt-4">
          <span>{error}</span>
        </div>
      )}

      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4 mt-4">
        <legend className="fieldset-legend">Decentralized identifier</legend>
        {isLoading ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : did ? (
          <div className="justify-center">
            <span>{did}</span>
          </div>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleCreateDid}
            disabled={apiStatus !== 'ok'}
          >
            Create DID
          </button>
        )}
      </fieldset>

      <form onSubmit={handleIssueCredential}>
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4 mt-4">
          <legend className="fieldset-legend">Issue Crdbl Credential</legend>

          <label className="label">Crdbl Content</label>
          <textarea
            className="textarea textarea-bordered min-h-[120px] max-h-[300px] w-full resize-y"
            placeholder=""
            value={credentialContent}
            onChange={(e) => setCredentialContent(e.target.value)}
            disabled={!did || isIssuing}
            required
          />

          <label className="label">Crdbl Context</label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder=""
            value={credentialContext}
            onChange={(e) => setCredentialContext(e.target.value)}
            disabled={!did || isIssuing}
          />
          <p className="label">
            List other referenced crdbls (space separated).
          </p>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={!did || isIssuing || !credentialContent}
          >
            {isIssuing ? 'Issuing...' : 'Issue Credential'}
          </button>
        </fieldset>
      </form>

      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4 mt-4">
        <legend className="fieldset-legend">My Crdbl Credentials</legend>
        {credentials.length === 0 ? (
          <div>No credentials found.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {credentials.map((cred, idx) => {
              // Extract main info
              const content =
                cred.credentialSubject?.alias ||
                cred.credentialSubject?.content ||
                '';
              const issuanceDate = cred.issuanceDate || '';
              // Hide proof.jwt for brevity in details
              const details = { ...cred };
              if (details.proof && details.proof.jwt) {
                details.proof = { ...details.proof, jwt: '[hidden]' };
              }
              return (
                <div className="collapse collapse-arrow bg-base-100" key={idx}>
                  <input type="checkbox" />
                  <div className="collapse-title font-medium flex flex-col gap-1">
                    <span className="text-base font-semibold">
                      {content || 'Credential'}
                    </span>
                    {issuanceDate && (
                      <span className="text-xs text-gray-500">
                        Issued: {new Date(issuanceDate).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="collapse-content">
                    <pre className="text-xs text-left whitespace-pre-wrap break-all bg-base-300 p-2 rounded-xl">
                      {JSON.stringify(details, null, 2)}
                    </pre>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </fieldset>
    </>
  );
}

export default App;
