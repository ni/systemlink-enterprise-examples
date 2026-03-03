import { useState } from "react";
import { NimbleButton } from "@ni/nimble-react/button";
import "../../styles/Header.css";

const Header = () => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const checkAllServices = async () => {
    if (isChecking) return;
    setIsChecking(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="header_left">
          <span className="header_logo" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 13h5l2.1-7 3.3 12 2.7-8H22" />
            </svg>
          </span>
          <h1 className="header_title">SystemLink Service Health Monitor</h1>
        </div>

        <div className="header_right">
          <label className="header_refresh">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh (30s)</span>
          </label>

          <NimbleButton
            className="header_button"
            appearance="block"
            onClick={checkAllServices}
            disabled={isChecking}
          >
            <span
              className={`header_button-icon ${isChecking ? "is-spinning" : ""}`}
              aria-hidden="true"
            >
              ↻
            </span>
            {isChecking ? "Checking Services..." : "Check All Services"}
          </NimbleButton>
        </div>
      </header>
    </div>
  );
};

export default Header;
