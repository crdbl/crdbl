import { useState, useEffect } from 'react';
import { CrdblCredentialIssueRequest, signWithHolderDid } from '@crdbl/utils';
import { storage } from '#imports';
import { config } from '../config';

// local storage for the holder DID
const holderDid = storage.defineItem<{
  did: string;
  privateKey: string;
}>('local:holderDid');

// local storage item for selected text
const selectedText = storage.defineItem<string>('local:selectedText');

export function CredentialIssueForm({
  disabled,
  onIssued,
}: {
  disabled?: boolean;
  onIssued?: () => void;
}) {
  const [credentialContent, setCredentialContent] = useState('');
  const [credentialContext, setCredentialContext] = useState('');
  const [isIssuing, setIsIssuing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      if (onIssued) onIssued();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to issue credential'
      );
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <form onSubmit={handleIssueCredential}>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4 mt-4">
        <legend className="fieldset-legend">Issue Crdbl Credential</legend>

        {error && (
          <div className="alert alert-error mb-2">
            <span>{error}</span>
          </div>
        )}

        <label className="label">Crdbl Content</label>
        <textarea
          className="textarea textarea-bordered min-h-[120px] max-h-[300px] w-full resize-y"
          placeholder=""
          value={credentialContent}
          onChange={(e) => setCredentialContent(e.target.value)}
          disabled={isIssuing || disabled}
          required
        />

        <label className="label">Crdbl Context</label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder=""
          value={credentialContext}
          onChange={(e) => setCredentialContext(e.target.value)}
          disabled={isIssuing || disabled}
        />
        <p className="label">List other referenced crdbls (space separated).</p>

        <button
          className="btn btn-primary"
          type="submit"
          disabled={isIssuing || !credentialContent || disabled}
        >
          {isIssuing ? 'Issuing...' : 'Issue Credential'}
        </button>
      </fieldset>
    </form>
  );
}
