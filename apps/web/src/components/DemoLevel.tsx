import { Link } from 'react-router';

interface Step {
  label: string;
  path: string;
  dataContent?: string;
}

interface DemoLevelProps {
  title: string;
  description: string;
  nextPath?: string;
  prevPath?: string;
  currentStep?: string;
  steps?: Step[];
  children: React.ReactNode;
}

export function DemoLevel({
  title,
  description,
  nextPath,
  prevPath,
  currentStep,
  steps,
  children,
}: DemoLevelProps) {
  return (
    <div className="flex flex-col gap-8">
      {steps && steps.length > 0 && (
        <ul className="steps w-full">
          {steps.map((step, index) => {
            const isActive =
              steps.findIndex((s) => s.path === currentStep) >= index;
            return (
              <li
                key={step.path}
                className={`step ${isActive ? 'step-primary' : ''}`}
                data-content={step.dataContent}
              >
                <Link to={step.path} className="cursor-pointer">
                  {step.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-lg opacity-80">{description}</p>
      </div>

      <div className="flex flex-col gap-8">{children}</div>

      <div className="flex justify-between items-center">
        <div className="flex-1"></div>
        <div className="join">
          {prevPath && (
            <Link to={prevPath} className="join-item btn">
              Previous
            </Link>
          )}
          {nextPath && (
            <Link to={nextPath} className="join-item btn btn-primary">
              Next
            </Link>
          )}
        </div>
        <div className="flex-1"></div>
      </div>
    </div>
  );
}
