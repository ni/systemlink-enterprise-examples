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

          <a
            className="github"
            href="https://github.com/Samuelsotogit/systemlink-enterprise-examples-fork"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="title">GitHub</span>
            <span className="head_text">Link to the GitHub repository with the source code and instructions how to create and use it</span>
          </a>

          <a
            className="Numble"
            href="https://nimble.ni.dev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="title">Nimble Design System</span>
            <span className="head_text">Library with the Nimble components</span>
          </a>

          <a
            className="Swagger"
            href="https://test-api.lifecyclesolutions.ni.com/niapis/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="title">SystemLink APIs</span>
            <span className="head_text">Link to the documentation for all SystemLink API calls</span>
          </a>

          <a
            className="npm"
            href="https://www.npmjs.com/package/@ni/nimble-react"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="title">NPM Nimble</span>
            <span className="head_text">Link to the npm package for Nimble React components</span>
          </a>

          <a
            className="CLI"
            href="https://github.com/ni-kismet/systemlink-cli"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="title">SystemLink CLI</span>
            <span className="head_text">Link to the GitHub instructions on how to use the CLI</span>
          </a>

        </div>



        <div className="content">
          <div className="button_and_title">

          <NimbleButton className="button" onClick={handleClick} appearance-variant="accent">
              Make API call
          </NimbleButton>
          </div>

          <h2 className="API_title">API call example</h2>

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
