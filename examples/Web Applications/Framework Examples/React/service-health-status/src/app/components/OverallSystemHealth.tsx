import type { JSX } from 'react';
import '../../styles/OverallSystemHealth.scss';
import type { HealthCheckMetadata } from './Header';
import type { ServiceStatusRecord } from './ServiceStatusData';

interface OverallSystemHealthProps {
    rows: ServiceStatusRecord[];
    metadata: HealthCheckMetadata | null;
}

const OverallSystemHealth = ({
    rows,
    metadata,
}: OverallSystemHealthProps): JSX.Element => {
    const hasRows = rows.length > 0;
    const allOperational = hasRows && rows.every(row => row.status === 'LIVE');
    let statusText = '-';
    if (metadata) {
        statusText = allOperational
            ? 'All systems operational'
            : 'Not all systems operational';
    }

    const lastCheckedText = metadata
        ? metadata.lastChecked.toLocaleString()
        : '-';

    const responseTimeText = metadata ? `${metadata.responseTimeMs} ms` : '-';
    const statusCodeText = metadata ? String(metadata.statusCode) : '-';

    return (
        <section className="overall-system-health">
            <div className="overall-system-health_header">
                <div className="overall-system-health_heading-group">
                    <h2 className="overall-system-health_title">Overall System Health</h2>
                    <p className="overall-system-health_subtitle">{statusText}</p>
                </div>

                <div className="overall-system-health_status">
                    <span
                        className={`overall-system-health_status-dot ${metadata && !allOperational ? 'overall-system-health_status-dot--degraded' : ''}`}
                        aria-hidden="true"
                    />
                    <span className="overall-system-health_status-text">
                        {statusText}
                    </span>
                </div>
            </div>

            <hr className="overall-system-health_divider" />

            <dl className="overall-system-health_metrics">
                <div className="overall-system-health_metric">
                    <dt className="overall-system-health_metric-label">Last Checked:</dt>
                    <dd className="overall-system-health_metric-value">
                        {lastCheckedText}
                    </dd>
                </div>

                <div className="overall-system-health_metric">
                    <dt className="overall-system-health_metric-label">Response Time:</dt>
                    <dd className="overall-system-health_metric-value">
                        {responseTimeText}
                    </dd>
                </div>

                <div className="overall-system-health_metric">
                    <dt className="overall-system-health_metric-label">
                        API Status Code:
                    </dt>
                    <dd className="overall-system-health_metric-value">
                        {statusCodeText}
                    </dd>
                </div>
            </dl>
        </section>
    );
};

export { OverallSystemHealth };
