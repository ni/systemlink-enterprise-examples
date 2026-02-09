import { NimbleButton } from "@ni/nimble-react/button";
import { useState } from "react";
import "./App.css";

const systemLinkServerUrl: string = import.meta.env.VITE_SYSTEMLINK_SERVER_URL;

function App() {
  const [apiResponse, setApiResponse] = useState("");

  const handleClick = () => {
    console.log("Button clicked");

    fetch(`${systemLinkServerUrl}/niauth/v1/auth`)
      .then((res) => res.json())
      .then((data) => {
        console.log("API response:", data);
        setApiResponse(JSON.stringify(data, null, 2));
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <div className="page">

        <div className="content">
          <div className="button_and_title">

          <NimbleButton className="button" onClick={handleClick} appearance-variant="accent">
              Make API call
          </NimbleButton>
          </div>

          <h2 className="title">API call example</h2>

          <div className="main_description">
            <div className="API">
              <div className="API_method_and_path">
                <span className="method">GET</span>
                <h3 className="path">/auth</h3>
              </div>
              <div>
                <span className="API_description_title">
                  Authenticates API Keys
                </span>
              </div>
              <div className="API_description">
                <span className="API_text">
                  The example makes an HTTP GET request to a SystemLink API and
                  displays the result on the page. This specific API Authenticates
                  the given x-ni-api-key and returns information about the call.
                </span>
              </div>
              <div className="API_response">{apiResponse}</div>
            </div>
          </div>
        </div>

        <div className="footer">
          <div className="header-left">
            <span className="demo">React Demo</span>
          </div>

          <div className="header-right">
            <a className="github" href="https://github.com/Samuelsotogit/systemlink-enterprise-examples-fork">
              Link to GitHub
            </a>
          </div>
        </div>

      </div>
    </>
  );
}

export default App;
