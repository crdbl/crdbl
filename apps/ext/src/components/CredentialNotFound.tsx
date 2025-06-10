import '../../entrypoints/verify.content/style.css';

export function CredentialNotFound({ id }: { id: string }) {
  return (
    <div className="collapse collapse-arrow bg-base-100 shadow-xl ring-2 ring-base-content/10">
      <input type="checkbox" />
      <div className="collapse-title font-medium flex flex-col gap-1">
        <span className="text-base font-semibold crdbl-warning">{id}</span>
      </div>
      <div className="collapse-content px-2">
        <div className="card-body p-2">
          <span className="text-xs text-gray-400">
            Credential not found in the registry.
          </span>
        </div>
      </div>
    </div>
  );
}
