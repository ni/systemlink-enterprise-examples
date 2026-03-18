import { useState } from "react";
import Header from "./components/Header";
import ServiceHealthSummary from "./components/ServiceHealthSummary";
import OverallSystemHealth from "./components/OverallSystemHealth";
import type { HealthCheckMetadata } from "./components/Header";
import ServiceStatusDetail, {
  defaultServiceRows,
  type ServiceStatusRecord,
} from "./components/ServiceStatusDetails";

const ServiceHealthDashboard = () => {
  const [serviceRows, setServiceRows] =
    useState<ServiceStatusRecord[]>(defaultServiceRows);
  const [healthCheckMetadata, setHealthCheckMetadata] =
    useState<HealthCheckMetadata | null>(null);

  const handleServicesLoaded = (
    rows: ServiceStatusRecord[],
    metadata: HealthCheckMetadata,
  ) => {
    setServiceRows(rows);
    setHealthCheckMetadata(metadata);
  };

  return (
    <>
      <Header onServicesLoaded={handleServicesLoaded} />
      <ServiceHealthSummary rows={serviceRows} metadata={healthCheckMetadata} />
      <OverallSystemHealth rows={serviceRows} metadata={healthCheckMetadata} />
      <ServiceStatusDetail rows={serviceRows} />
    </>
  );
};

export default ServiceHealthDashboard;
