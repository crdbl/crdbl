import { useState, useEffect } from 'react';
import reactLogo from '@/assets/react.svg';
import { createHolderDid, signWithHolderDid } from '@crdbl/utils';
import { storage } from '#imports';
import { config } from '../../config';
import './App.css';

// local storage for the holder DID
const holderDid = storage.defineItem<{
  did: string;
  privateKey: string;
}>('local:holderDid');

function App() {
  const [count, setCount] = useState(0);
  const [did, setDid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'ok' | 'error' | 'checking'>(
    'checking'
  );
  const [credentialContent, setCredentialContent] = useState('');
  const [credentials, setCredentials] = useState<any[]>([]);
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
      const data = await res.json();
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

  // Handler for credential issuance
  const handleIssueCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsIssuing(true);
    setError(null);
    try {
      const stored = await holderDid.getValue();
      if (!stored) throw new Error('No holder DID found');
      const signature = await signWithHolderDid(
        stored.privateKey,
        credentialContent
      );
      const res = await fetch(`${config.API_URL}/credential/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectDid: stored.did,
          attributes: { content: credentialContent },
          signature,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setCredentialContent('');
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
      <div className="prose">
        <h1>crdbl</h1>
      </div>
      <div className="flex justify-center">
        <a href="https://wxt.dev" target="_blank">
          <img src="/wxt.svg" className="logo" alt="WXT logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      {/* API Status Indicator */}
      <div className="card card-border bg-base-200 mb-4">
        <div className="card-body">
          <h2 className="card-title">API Status</h2>
          <div className="flex items-center gap-2">
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
      </div>

      <div className="card card-border bg-base-200">
        <div className="card-body">
          <button
            className="btn"
            onClick={() => setCount((count) => count + 1)}
          >
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
      </div>

      <div className="card card-border bg-base-200 mt-4">
        <div className="card-body">
          <h2 className="card-title">DID Management</h2>
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}
          {isLoading ? (
            <div className="flex justify-center">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : did ? (
            <div className="alert alert-success">
              <span>Your DID: {did}</span>
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
        </div>
      </div>

      <div className="card card-border bg-base-200 mt-4">
        <div className="card-body">
          <h2 className="card-title">Issue Credential</h2>
          <form
            onSubmit={handleIssueCredential}
            className="flex flex-col gap-2"
          >
            <input
              type="text"
              className="input input-bordered"
              placeholder="Enter credential content"
              value={credentialContent}
              onChange={(e) => setCredentialContent(e.target.value)}
              disabled={!did || isIssuing}
              required
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={!did || isIssuing || !credentialContent}
            >
              {isIssuing ? 'Issuing...' : 'Issue Credential'}
            </button>
          </form>
        </div>
      </div>

      <div className="card card-border bg-base-200 mt-4">
        <div className="card-body">
          <h2 className="card-title">Your Credentials</h2>
          {credentials.length === 0 ? (
            <div>No credentials found.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {credentials.map((cred, idx) => {
                // Extract main info
                const content =
                  cred.credentialSubject?.content ||
                  cred.attributes?.content ||
                  '';
                const issuanceDate =
                  cred.issuanceDate ||
                  cred.issuance_date ||
                  cred.createdAt ||
                  cred.created_at ||
                  '';
                // Hide proof.jwt for brevity in details
                const details = { ...cred };
                if (details.proof && details.proof.jwt) {
                  details.proof = { ...details.proof, jwt: '[hidden]' };
                }
                return (
                  <div
                    className="collapse collapse-arrow bg-base-100"
                    key={idx}
                  >
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
                      <pre className="mockup-code text-xs text-left whitespace-pre-wrap break-all">
                        {JSON.stringify(details, null, 2)}
                      </pre>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
