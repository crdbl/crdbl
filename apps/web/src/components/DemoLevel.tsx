import { Link } from 'react-router';

interface DemoLevelProps {
  title: string;
  description: string;
  nextPath?: string;
  prevPath?: string;
  children: React.ReactNode;
}

export function DemoLevel({
  title,
  description,
  nextPath,
  prevPath,
  children,
}: DemoLevelProps) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-lg opacity-80">{description}</p>
      </div>

      <div className="flex flex-col gap-8">{children}</div>

      <div className="divider"></div>

      <div className="flex justify-between items-center">
        <div className="flex-1"></div>
        <div className="join">
          {prevPath && (
            <Link to={prevPath} className="join-item btn">
              Previous Level
            </Link>
          )}
          {nextPath && (
            <Link to={nextPath} className="join-item btn btn-primary">
              Next Level
            </Link>
          )}
        </div>
        <div className="flex-1"></div>
      </div>
    </div>
  );
}
