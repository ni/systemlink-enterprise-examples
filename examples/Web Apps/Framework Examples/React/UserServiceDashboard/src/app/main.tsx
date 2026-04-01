import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { NimbleThemeProvider } from "@ni/nimble-react/theme-provider";
import { UserServiceDashboard } from "./UserServiceDashboard";
import "../styles/main.scss";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NimbleThemeProvider theme="light">
      <div className="app-wrapper">
        <UserServiceDashboard />
      </div>
    </NimbleThemeProvider>
  </StrictMode>,
);
