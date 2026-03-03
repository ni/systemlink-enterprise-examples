import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ServiceHealthDashboard from "./ServiceHealthDashboard";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ServiceHealthDashboard />
  </StrictMode>,
);
