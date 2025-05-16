import './App.css';

function App() {
  return (
    <div className="flex flex-col gap-4 prose">
      <h1>crdbl</h1>
      <br />
      <span>crdbl:MfJQRF9Jdr</span>
      <span>crdbl:111111111</span>
      <br />
      This crdbl is inside of a `data-crdbl` tag'd div:
      <div data-crdbl="MfJQRF9Jdr">me verifiable content here</div>
      <div data-crdbl="XXXXXXXXXX">this not verifiable content here</div>
    </div>
  );
}

export default App;
