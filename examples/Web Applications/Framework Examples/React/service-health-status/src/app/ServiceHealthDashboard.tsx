import { useState } from "react";
import Header from "./components/header";
import ServiceHealthSummary from "./components/ServiceHealthSummary";
import OverallSystemHealth from "./components/OverallSystemHealth";
import ServiceStatusDetail, {
  defaultServiceRows,
  type ServiceStatusRecord,
} from "./components/ServiceStatusDetails";

const ServiceHealthDashboard = () => {
  const [serviceRows, setServiceRows] =
    useState<ServiceStatusRecord[]>(defaultServiceRows);

  return (
    <>
      <Header onServicesLoaded={setServiceRows} />
      <ServiceHealthSummary />
      <OverallSystemHealth />
      <ServiceStatusDetail rows={serviceRows} />
    </>
  );
};

export default ServiceHealthDashboard;
