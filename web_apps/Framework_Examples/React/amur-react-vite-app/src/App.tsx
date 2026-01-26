import { NimbleButton } from '@ni/nimble-react/button'
import "./App.css";



function App() {
  const handleClick = () => {
    console.log("Button clicked");

    fetch('http://localhost:4000/api/ni-auth')
      .then(res => res.json())
      .then(data => console.log('API response:', data))
      .catch(err => console.error(err));
  };

  return (
    <>
    <h2 className='title'>
      API call example
    </h2>
      <div className='main_description'>


        <div className='API'>

        <div className='first_line'>
          <span className="method">GET</span>
            <h3 className="path">/auth</h3>
          <span className='mini_description'>Authenticates API Keys</span>
        </div>
        
        <div className='second_line'>
          <span className='text'>
            The example makes an HTTP GET request to a SystemLink API and displays the result on the page.
             This specific API Authenticates the given x-ni-api-key and returns information about the call.
          </span>
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
