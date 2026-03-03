import "../../styles/OverallSystemHealth.css";

const OverallSystemHealth = () => {
  return (
    <section className="overall-system-health">
      <div className="overall-system-health_header">
        <div className="overall-system-health_heading-group">
          <h2 className="overall-system-health_title">Overall System Health</h2>
          <p className="overall-system-health_subtitle">
            All systems operational / Not All systems operational
          </p>
        </div>

        <div className="overall-system-health_status">
          <span
            className="overall-system-health_status-dot"
            aria-hidden="true"
          />
          <span className="overall-system-health_status-text">-</span>
        </div>
      </div>

      <hr className="overall-system-health_divider" />

      <dl className="overall-system-health_metrics">
        <div className="overall-system-health_metric">
          <dt className="overall-system-health_metric-label">Last Checked:</dt>
          <dd className="overall-system-health_metric-value">-</dd>
        </div>

        <div className="overall-system-health_metric">
          <dt className="overall-system-health_metric-label">Response Time:</dt>
          <dd className="overall-system-health_metric-value">-</dd>
        </div>

        <div className="overall-system-health_metric">
          <dt className="overall-system-health_metric-label">
            API Status Code:
          </dt>
          <dd className="overall-system-health_metric-value">-</dd>
        </div>
      </dl>
    </section>
  );
};

export default OverallSystemHealth;
