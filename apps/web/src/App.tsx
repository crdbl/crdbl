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
} from './pages/DemoProvenance';
import './App.css';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-12 py-12">
      <h1 className="text-4xl font-bold">Building the Credible Web</h1>
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
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

function Layout() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Header */}
      <div className="navbar bg-base-100 border-b border-base-300 px-4">
        <div className="flex-1">
          <Link to="/" className="flex items-center gap-2">
            <img src="/crdbl.svg" className="h-8 w-8" alt="Crdbl logo" />
            <span className="text-xl font-bold">crdbl</span>
          </Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link to="/demo/provenance/a" className="btn btn-ghost">
                Demo
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 w-full">
        <div className="max-w-4xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
