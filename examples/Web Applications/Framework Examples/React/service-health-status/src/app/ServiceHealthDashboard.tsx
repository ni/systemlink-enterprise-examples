import { useCallback, useState, type JSX } from 'react';
import { Header, type HealthCheckMetadata } from './components/Header';
import { ServiceHealthSummary } from './components/ServiceHealthSummary';
import { OverallSystemHealth } from './components/OverallSystemHealth';
import { ServiceStatusDetail } from './components/ServiceStatusDetails';
import {
    defaultServiceRows,
    type ServiceStatusRecord,
} from './components/ServiceStatusData';

const ServiceHealthDashboard = (): JSX.Element => {
    const [serviceRows, setServiceRows] = useState<ServiceStatusRecord[]>(defaultServiceRows);
    const [healthCheckMetadata, setHealthCheckMetadata] = useState<HealthCheckMetadata | null>(null);

    const handleServicesLoaded = useCallback(
        (rows: ServiceStatusRecord[], metadata: HealthCheckMetadata): void => {
            setServiceRows(rows);
            setHealthCheckMetadata(metadata);
        },
        [],
    );

    return (
        <>
            <Header onServicesLoaded={handleServicesLoaded} />
            <ServiceHealthSummary rows={serviceRows} metadata={healthCheckMetadata} />
            <OverallSystemHealth rows={serviceRows} metadata={healthCheckMetadata} />
            <ServiceStatusDetail rows={serviceRows} />
        </>
    );
};

export { ServiceHealthDashboard };
