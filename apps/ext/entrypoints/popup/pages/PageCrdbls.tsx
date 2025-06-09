import { useEffect, useState } from 'react';
import { CrdblCredential } from '@crdbl/utils';
import { CredentialListItem } from '../../../src/components/CredentialListItem';
import { pageCredentials } from '../../../src/storage';
import { sendMessage } from '../../../src/messaging';

export function PageCrdbls() {
  const [credentials, setCredentials] = useState<
    Record<string, CrdblCredential | null>
  >({});
  const [verifStatus, setVerifStatus] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPageCredentials = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current tab
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.url) throw new Error('No active tab found');

      // Get credentials from storage
      const creds = await pageCredentials.getValue();
      const crdbls = creds?.[tab.url] || [];

      if (crdbls.length === 0) {
        setCredentials({});
        return;
      }

      const verif = await sendMessage('getCrdblVerification', crdbls);
      setVerifStatus(verif);

      const credData = await sendMessage('getCrdblData', crdbls);
      setCredentials(credData);

      console.log('verifs', verifStatus);
      console.log('data', credData);
    } catch (err) {
      console.error('Error in fetchPageCredentials:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch page credentials'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch credentials on mount and when storage changes
  useEffect(() => {
    fetchPageCredentials();

    // Watch for storage changes
    const unwatch = pageCredentials.watch(() => fetchPageCredentials());
    return () => unwatch();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  if (Object.keys(credentials).length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        No verifiable credentials found on this page.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      {Object.entries(credentials)
        .filter(([, cred]) => cred != null)
        .map(([key, cred]) => (
          <CredentialListItem key={key} cred={cred!} />
        ))}

      {/* Not Found Crdbls */}
      {Object.entries(credentials)
        .filter(([, cred]) => cred == null)
        .map(([key]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-lg text-warning">?</span>
            <span className="font-mono">crdbl:{key}</span>
            <span className="text-sm text-gray-500">(not found)</span>
          </div>
        ))}
    </div>
  );
}
