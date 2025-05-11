import { useState, useEffect } from 'react';
import reactLogo from '@/assets/react.svg';
import { config } from '../../config';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [apiStatus, setApiStatus] = useState<'ok' | 'error' | 'checking'>(
    'checking'
  );

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${config.API_URL}/health`);
        setApiStatus(response.ok ? 'ok' : 'error');
      } catch (err) {
        setApiStatus('error');
      }
    };

    checkHealth();
  }, []);

  return (
    <>
      <div className="flex justify-center">
        <a href="https://wxt.dev" target="_blank">
          <img src="/wxt.svg" className="logo" alt="WXT logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>WXT + React</h1>

      {/* API Status Indicator */}
      <div className="card card-border bg-base-200 mb-4">
        <div className="card-body">
          <h2 className="card-title">API Status</h2>
          <div className="flex items-center gap-2">
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
      </div>

      <div className="card card-border bg-base-200">
        <div className="card-body">
          <button
            className="btn"
            onClick={() => setCount((count) => count + 1)}
          >
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
      </div>
      <p className="read-the-docs">
        Click on the WXT and React logos to learn more
      </p>
    </>
  );
}

export default App;
