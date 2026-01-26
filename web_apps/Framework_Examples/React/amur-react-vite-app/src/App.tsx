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
