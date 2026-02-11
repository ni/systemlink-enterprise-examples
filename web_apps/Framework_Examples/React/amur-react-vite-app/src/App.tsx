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

        <div className="header">

            <div className="github">
              <a
                href="https://github.com/Samuelsotogit/systemlink-enterprise-examples-fork"
                target="_blank"
                rel="noopener noreferrer"
              >
                Link to GitHub
              </a>
              <span>link to the Gihub repository with the source code and instructions hwo to create it and use it</span>
            </div>

            <div className="Numble">
              <a className="Nimlbe_link" href="https://nimble.ni.dev/">
                  Nimble Design System
              </a>
              <span>library with the nimle components</span>
            </div>

            <div className="Swagger" >
              <a className="Swagger_link" href="https://test-api.lifecyclesolutions.ni.com/niapis/">
                  Systemlink APIs
              </a>
              <span>link to the documentatio to all SystemLInk apis calls</span>
            </div>

            <div className="npm">
              <a className="npm_link" href="https://www.npmjs.com/package/@ni/nimble-react">
                  Nimble React npm package
              </a>
              <span> link to the npm package to enable the use of the Nimble components in React</span>
            </div>

            <div className="CLI">
              <a className="CLI_link" href="https://github.com/ni-kismet/systemlink-cli">
                  Systemlink CLI instructions
              </a>
              <span>link to the GItHub instructions how to use CLI</span>
            </div>

        </div>


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

      </div>
    </>
  );
}

export default App;
