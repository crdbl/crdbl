import './App.css';

function App() {
  return (
    <div className="flex flex-col justify-center prose">
      <h2>Crdbl: Building the Credible Web</h2>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4 w-full">
        <legend className="fieldset-legend">embedded crdbl demo</legend>
        <div className="flex flex-col gap-4 prose">
          <label className="label">Text Reference:</label>
          <span>crdbl:wTNhMzcM8g</span>
          <span>crdbl:111111111</span>
          <label className="label">HTML Attributes:</label>
          <div data-crdbl="wTNhMzcM8g">verifiably credible content here</div>
          <div data-crdbl="XXXXXXXXXX">
            this content is not verifiably credible
          </div>
        </div>
      </fieldset>
    </div>
  );
}

export default App;
