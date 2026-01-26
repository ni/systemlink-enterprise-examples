import { NimbleButton } from '@ni/nimble-react/button'
import { useState } from 'react';
import "./App.css";



function App() {
  const [apiResponse, setApiResponse] = useState('');

  const handleClick = () => {
    console.log("Button clicked");

    fetch('http://localhost:4000/api/ni-auth')
      .then(res => res.json())
      .then(data => {
        console.log('API response:', data);
        setApiResponse(JSON.stringify(data, null, 2));
      })
      .catch(err => console.error(err));
  };

  return (
    <>
    <h2 className='title'>
      API call example
    </h2>
      <div className='main_description'>
        <div className='API'>
          <div className='API_method_and_path'>
            <span className="method">GET</span>
              <h3 className="path">/auth</h3>
          </div>
          <div>
            <span className='API_description_title'>Authenticates API Keys</span>
          </div>
          <div className='API_description'>
            <span className='API_text'>
              The example makes an HTTP GET request to a SystemLink API and displays the result on the page.This specific API Authenticates the given x-ni-api-key and returns information about the call.
            </span>
          </div>
          <div className='API_response'>
            {apiResponse}
          </div>
        </div>

        <NimbleButton className="button" onClick={handleClick}>
          Make API call
        </NimbleButton>

      </div>
    </>
  )
}

export default App
