import reactLogo from "./assets/react.svg";
import "./App.css";
import FilterRecords from "./components/filterRecords";

function App() {
  return (
    <>
      <div>
        <img src={reactLogo} className="logo react" alt="React logo" />
      </div>
      <FilterRecords />
    </>
  );
}

export default App;
