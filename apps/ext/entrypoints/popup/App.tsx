import { createHashRouter, Link, Outlet, RouterProvider } from 'react-router';
import crdblLogo from '@/assets/crdbl.svg';
import { config } from '../../src/config';
import { MyCrdbls } from './pages/MyCrdbls';
import { Settings } from './pages/Settings';
import { SettingsProvider } from '../../src/context/SettingsProvider';
import { IconCog, IconEllipsisVertical } from '../../src/components/icons';
import './App.css';

export default function App() {
  const router = createHashRouter([
    {
      element: <Layout />,
      children: [
        {
          path: '/',
          element: <MyCrdbls />,
        },
        {
          path: '/settings',
          element: <Settings />,
        },
      ],
    },
  ]);

  return (
    <SettingsProvider>
      <RouterProvider router={router} />
    </SettingsProvider>
  );
}

function Layout() {
  const [apiStatus, setApiStatus] = useState<'ok' | 'error' | 'checking'>(
    'checking'
  );
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${config.API_URL}/health`);
        setApiStatus(response.ok ? 'ok' : 'error');
      } catch (err) {
        void err; // make eslint happy
        setApiStatus('error');
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Header */}
      <div className="navbar bg-base-100 border-b border-base-300 px-4">
        <div className="flex-1">
          <Link to="/" className="flex items-center gap-2">
            <img src={crdblLogo} className="h-8 w-8" alt="Crdbl logo" />
            <span className="text-xl font-bold">crdbl</span>
          </Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link to="/" className="btn btn-ghost">
                MyCrdbls
              </Link>
            </li>
            <li>
              <details className="dropdown dropdown-end">
                <summary className="btn btn-ghost after:content-none">
                  <IconEllipsisVertical className="size-5" />
                </summary>
                <ul
                  className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                  onClick={(e) => {
                    const details = e.currentTarget.closest('details');
                    if (details) details.removeAttribute('open');
                  }}
                >
                  <li>
                    <Link to="/settings" className="flex items-center gap-2">
                      <IconCog className="size-5" />
                      Settings
                    </Link>
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        </div>
      </div>

      {/* API Status Indicator */}
      <div className="bg-base-200 border-base-300 border-b p-2">
        <div className="flex justify-center items-center gap-2">
          <span>API Status:</span>
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

      {/* Main Content */}
      <main className="flex-1 p-4 w-full">
        <div className="max-w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
