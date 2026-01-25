import { NimbleButton } from '@ni/nimble-react/button'
import "./App.css";
import config from "./config";



function App() {
  const handleClick = () => {
    console.log("Button clicked");
    console.log("API key:", config.api_key);
  };

  return (
    <>
    <h2 className='title'>
      API call example
    </h2>
      <div className="API">


        <div className='first_line'>
          <span className="method">GET</span>
            <h3 className="path">/auth</h3>
          <span className='description'>Authenticates API Keys</span>
        </div>

      <NimbleButton className="button" onClick={handleClick}>
        Make API call
      </NimbleButton>
      </div>
    </>
  )
}

export default App
