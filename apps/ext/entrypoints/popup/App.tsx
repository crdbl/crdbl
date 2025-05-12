import { useState, useEffect } from 'react';
import reactLogo from '@/assets/react.svg';
import { createHolderDid } from '@crdbl/utils';
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

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${config.API_URL}/health`);
        setApiStatus(response.ok ? 'ok' : 'error');
      } catch (err) {
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

  return (
    <>
      <div className="flex justify-center">
        <a href="https://wxt.dev" target="_blank">
          <img src="/wxt.svg" className="logo" alt="WXT logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>crdbl</h1>

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
    </>
  );
}

export default App;
