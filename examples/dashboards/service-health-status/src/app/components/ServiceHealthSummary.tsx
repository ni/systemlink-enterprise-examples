import "../../styles/ServiceHealthSummary.css";

const ServiceHealthSummary = () => {
  return (
    <section
      className="service-health-summary"
      aria-label="Service health summary"
    >
      <article className="summary-card summary-card--healthy">
        <h2 className="summary-card_label">Healthy Services</h2>
        <p className="summary-card_value">-</p>
        <p className="summary-card_subvalue">-</p>
      </article>

      <article className="summary-card summary-card--failed">
        <h2 className="summary-card_label">Failed Services</h2>
        <p className="summary-card_value">-</p>
        <p className="summary-card_subvalue">-</p>
      </article>

      <article className="summary-card summary-card--pending">
        <h2 className="summary-card_label">Pending</h2>
        <p className="summary-card_value">-</p>
      </article>

      <article className="summary-card summary-card--response">
        <h2 className="summary-card_label">Avg Response</h2>
        <p className="summary-card_value">-</p>
        <p className="summary-card_subvalue">milliseconds</p>
      </article>

      <article className="summary-card summary-card--total">
        <h2 className="summary-card_label">Total Services</h2>
        <p className="summary-card_value">20</p>
      </article>
    </section>
  );
};

export default ServiceHealthSummary;
