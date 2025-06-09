import { CrdblCredential } from '@crdbl/utils';
import { config } from '../config';
import '../../entrypoints/verify.content/style.css';

// Component for displaying a credential and its IPFS content
export function CredentialListItem({
  cred,
  verified,
}: {
  cred: CrdblCredential;
  verified?: boolean;
}) {
  const title = cred.credentialSubject.alias || 'Credential';
  const issuanceDate = cred.issuanceDate || '';
  const details = { ...cred };
  if (details.proof && details.proof.jwt) {
    details.proof = { ...details.proof, jwt: '[hidden]' };
  }
  const id = cred.id;
  const cid = cred.credentialSubject.content;

  const verifClassname =
    verified === undefined ? '' : verified ? 'crdbl-checked' : 'crdbl-warning';

  return (
    <div className="collapse collapse-arrow bg-base-100">
      <input type="checkbox" />
      <div className="collapse-title font-medium flex flex-col gap-1">
        <span className={`text-base font-semibold ${verifClassname}`}>
          crdbl:{title}
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
            name={`tabs_${id}`}
            className="tab"
            aria-label="Content"
            defaultChecked
          />
          <div className="tab-content bg-base-100 border-base-300">
            <div className="card-body p-2">
              {cid ? (
                <iframe
                  src={`${config.IPFS_URL}/${cid}`}
                  sandbox=""
                  referrerPolicy="no-referrer"
                  className="w-full min-h-[300px] max-h-[500px] rounded-xl bg-base-300"
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

          <input
            type="radio"
            name={`tabs_${id}`}
            className="tab"
            aria-label="Credential"
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
