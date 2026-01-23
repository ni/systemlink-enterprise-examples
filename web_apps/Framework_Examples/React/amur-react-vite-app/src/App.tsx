import { NimbleButton } from '@ni/nimble-react/button'
import "./App.css";
import config from "./demo_config";

console.log(config.api_key);

function App() {

  return (
    <>
      <div className="API">
        <p className="path"></p>
        <NimbleButton className='button'>Make API call</NimbleButton>
      </div>
    </>
  )
}
//new version
export default App
