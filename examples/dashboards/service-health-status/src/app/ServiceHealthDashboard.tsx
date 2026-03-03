import Header from "./components/header";
import ServiceHealthSummary from "./components/ServiceHealthSummary";
import OverallSystemHealth from "./components/OverallSystemHealth";

const ServiceHealthDashboard = () => {
  return (
    <>
      <Header />
      <ServiceHealthSummary />
      <OverallSystemHealth />
    </>
  );
};

export default ServiceHealthDashboard;
