import {
  createBrowserRouter,
  Link,
  Outlet,
  RouterProvider,
} from 'react-router';
import {
  DemoProvenanceA,
  DemoProvenanceB,
  DemoProvenanceC,
  DemoProvenanceD,
} from './pages/DemoProvenance';
import { DemoBasic } from './pages/DemoBasic';
import './App.css';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-12 py-12">
      <h1 className="text-4xl font-bold">crdbl: Building the Credible Web</h1>
      <img src="/crdbl.svg" className="logo scale-100" alt="Crdbl logo" />
    </div>
  );
}

export default function App() {
  const router = createBrowserRouter([
    {
      element: <Layout />,
      children: [
        {
          path: '/',
          element: <Home />,
        },
        {
          path: '/demo/basic',
          element: <DemoBasic />,
        },
        {
          path: '/demo/provenance/a',
          element: <DemoProvenanceA />,
        },
        {
          path: '/demo/provenance/b',
          element: <DemoProvenanceB />,
        },
        {
          path: '/demo/provenance/c',
          element: <DemoProvenanceC />,
        },
        {
          path: '/demo/provenance/d',
          element: <DemoProvenanceD />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-base-300">
        <nav className="max-w-[75rem] mx-auto px-4">
          <div className="navbar bg-base-100">
            <Link to="/" className="flex items-center gap-2 flex-1">
              <img src="/crdbl.svg" className="h-8 w-8" alt="Crdbl logo" />
              <span className="text-xl font-bold">crdbl</span>
            </Link>
            <ul className="menu menu-horizontal">
              <li>
                <details className="dropdown dropdown-end">
                  <summary className="btn btn-ghost">Demos</summary>
                  <ul
                    className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                    onClick={(e) => {
                      const details = e.currentTarget.closest('details');
                      if (details) details.removeAttribute('open');
                    }}
                  >
                    <li>
                      <Link to="/demo/basic">Basic</Link>
                    </li>
                    <li>
                      <Link to="/demo/provenance/a">Provenance</Link>
                    </li>
                  </ul>
                </details>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <div className="max-w-[75rem] mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
