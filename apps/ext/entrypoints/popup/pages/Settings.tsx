import { ThemeController } from '../components/ThemeController';

export function Settings() {
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8">
      {/* Appearance Section */}
      <div className="space-y-2 text-left">
        <h2 className="text-md font-medium text-base-content/80">Appearance</h2>
        <div className="card bg-base-100 shadow-xl ring-2 ring-base-content/10">
          <div className="card-body">
            <ThemeController />
          </div>
        </div>
      </div>
    </div>
  );
}
