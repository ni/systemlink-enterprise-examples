import Header from "./components/header";
import ServiceHealthSummary from "./components/ServiceHealthSummary";
import OverallSystemHealth from "./components/OverallSystemHealth";
import ServiceStatusDetail from "./components/ServiceStatusDetails";

const ServiceHealthDashboard = () => {
  return (
    <>
      <Header />
      <ServiceHealthSummary />
      <OverallSystemHealth />
      <ServiceStatusDetail />
    </>
  );
};

export default ServiceHealthDashboard;
