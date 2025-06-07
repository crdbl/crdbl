import { useState, useEffect } from 'react';
import crdblLogo from '@/assets/crdbl.svg';
import { CrdblCredential, createHolderDid } from '@crdbl/utils';
import { config } from '../../src/config';
import { holderDid } from '../../src/storage';
import { CredentialIssueForm } from '../../src/components/CredentialIssueForm';
import { CredentialListItem } from '../../src/components/CredentialListItem';
import './App.css';

function App() {
  const [did, setDid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'ok' | 'error' | 'checking'>(
    'checking'
  );
  const [credentials, setCredentials] = useState<CrdblCredential[]>([]);

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

  return (
    <>
      <div className="flex justify-center">
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

      {did && (
        <>
          <CredentialIssueForm
            disabled={isLoading || apiStatus !== 'ok'}
            onIssued={() => fetchCredentials(did)}
          />

          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4 mt-4">
            <legend className="fieldset-legend">My Crdbl Credentials</legend>
            {credentials.length === 0 ? (
              <div>No credentials found.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {credentials.map((cred) => (
                  <CredentialListItem
                    key={cred.credentialSubject.id}
                    cred={cred}
                  />
                ))}
              </div>
            )}
          </fieldset>
        </>
      )}
    </>
  );
}

export default App;
