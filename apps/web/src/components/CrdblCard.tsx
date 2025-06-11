interface CrdblCardProps {
  title: string;
  content: string;
  context?: string[];
  contradictions?: string[];
  whyWorks: string[];
  crdblId: string;
  label: string;
  getRefData: (ref: string) => { title: string };
}

export function CrdblCard({
  title,
  content,
  context,
  contradictions,
  whyWorks,
  crdblId,
  label,
  getRefData,
}: CrdblCardProps) {
  return (
    <div className="card bg-base-200 shadow-lg ring-1 ring-base-300">
      <div className="card-body">
        <h2 className="card-title text-left">
          <span className="text-primary font-mono mr-2">{label}</span>
          {title}
        </h2>
        <div data-crdbl={crdblId} className="text-lg text-left">
          {content}
        </div>

        {context && context.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-left mb-2">Context References</h3>
            <ul className="list-disc list-inside text-left">
              {context.map((ref: string) => {
                const refData = getRefData(ref);
                return (
                  <li key={ref} className="ml-4">
                    <span className="text-primary font-mono mr-2">{ref}</span>
                    {refData.title}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {contradictions && contradictions.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-left mb-2">
              Example Contradictions
            </h3>
            <ul className="list-disc list-inside text-left">
              {contradictions.map((contradiction: string, i: number) => (
                <li key={i} className="ml-4">
                  {contradiction}
                </li>
              ))}
            </ul>
          </div>
        )}

        {whyWorks && (
          <div className="mt-6">
            {whyWorks.length === 1 ? (
              <div className="text-sm text-left">
                <span className="font-medium opacity-70">Why This Works:</span>{' '}
                <span className="italic opacity-80">{whyWorks[0]}</span>
              </div>
            ) : (
              <>
                <h3 className="text-sm font-medium text-left mb-2 opacity-70">
                  Why This Works
                </h3>
                <ul className="list-disc list-inside text-left text-sm italic opacity-80">
                  {whyWorks.map((reason: string, i: number) => (
                    <li key={i} className="ml-4">
                      {reason}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
