import "../../styles/ServiceHealthSummary.css";
import type { HealthCheckMetadata } from "./Header";
import type { ServiceStatusRecord } from "./ServiceStatusDetails";

type ServiceHealthSummaryProps = {
  rows: ServiceStatusRecord[];
  metadata: HealthCheckMetadata | null;
};

const ServiceHealthSummary = ({
  rows,
  metadata,
}: ServiceHealthSummaryProps) => {
  const totalServices = rows.length;
  const hasCheckData = metadata !== null;

  const healthyCount = rows.filter((row) => row.status === "LIVE").length;
  const failedCount = rows.filter(
    (row) => row.status !== "LIVE" && row.status !== "PENDING",
  ).length;
  const pendingCount = rows.filter((row) => row.status === "PENDING").length;

  const healthyPercent =
    totalServices > 0 ? Math.round((healthyCount / totalServices) * 100) : 0;
  const failedPercent =
    totalServices > 0 ? Math.round((failedCount / totalServices) * 100) : 0;

  const healthyValueText = hasCheckData ? String(healthyCount) : "-";
  const healthySubvalueText = hasCheckData
    ? `${healthyPercent}% of total`
    : "-";
  const failedValueText = hasCheckData ? String(failedCount) : "-";
  const failedSubvalueText = hasCheckData ? `${failedPercent}% of total` : "-";
  const pendingValueText = hasCheckData ? String(pendingCount) : "-";
  const avgResponseText = hasCheckData ? String(metadata.responseTimeMs) : "-";
  const totalValueText = hasCheckData ? String(totalServices) : "-";

  return (
    <section
      className="service-health-summary"
      aria-label="Service health summary"
    >
      <article className="summary-card summary-card--healthy">
        <h2 className="summary-card_label">Healthy Services</h2>
        <p className="summary-card_value">{healthyValueText}</p>
        <p className="summary-card_subvalue">{healthySubvalueText}</p>
      </article>

      <article className="summary-card summary-card--failed">
        <h2 className="summary-card_label">Failed Services</h2>
        <p className="summary-card_value">{failedValueText}</p>
        <p className="summary-card_subvalue">{failedSubvalueText}</p>
      </article>

      <article className="summary-card summary-card--pending">
        <h2 className="summary-card_label">Pending</h2>
        <p className="summary-card_value">{pendingValueText}</p>
      </article>

      <article className="summary-card summary-card--response">
        <h2 className="summary-card_label">Avg Response</h2>
        <p className="summary-card_value">{avgResponseText}</p>
        <p className="summary-card_subvalue">milliseconds</p>
      </article>

      <article className="summary-card summary-card--total">
        <h2 className="summary-card_label">Total Services</h2>
        <p className="summary-card_value">{totalValueText}</p>
      </article>
    </section>
  );
};

export default ServiceHealthSummary;
