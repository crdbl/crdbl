import { useEffect, useState } from 'react';
import { CrdblCredential, createHolderDid } from '@crdbl/utils';
import { config } from '../../../src/config';
import { holderDid } from '../../../src/storage';
import { CredentialIssueForm } from '../../../src/components/CredentialIssueForm';
import { CredentialListItem } from '../../../src/components/CredentialListItem';

export function MyCrdbls() {
  const [did, setDid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [credentials, setCredentials] = useState<CrdblCredential[]>([]);

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
    <div className="w-full">
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
        <legend className="fieldset-legend">Decentralized Identifier</legend>
        {isLoading ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : did ? (
          <div className="justify-center">
            <span>{did}</span>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={handleCreateDid}>
            Create DID
          </button>
        )}
      </fieldset>

      {did && (
        <>
          <CredentialIssueForm
            disabled={isLoading}
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
    </div>
  );
}
