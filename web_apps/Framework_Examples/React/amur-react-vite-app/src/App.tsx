import { NimbleButton } from '@ni/nimble-react/button'
import "./App.css";
import config from "./config";

console.log(config.api_key);

function App() {
  const handleClick = () => {
    console.log("Button clicked");
    console.log("API key:", config.api_key);
  };

  return (
    <>
      <div className="API">

        <p className="path"> <p className='method'>GET</p>/auth</p>

      <NimbleButton className="button" onClick={handleClick}>
        Make API call
      </NimbleButton>
      </div>
    </>
  )
}

export default App
