import { useEffect, useRef } from "react";
import { NimbleTable, fromTableRef, type Table } from "@ni/nimble-react/table";
import { NimbleTableColumnText } from "@ni/nimble-react/table-column/text";
import "../../styles/ServiceStatusDetails.css";

export type ServiceStatusRecord = {
  id: string;
  serviceName: string;
  status: string;
};

export const defaultServiceRows: ServiceStatusRecord[] = [
  { id: "Repository", serviceName: "Repository", status: "-" },
  { id: "TestMonitor", serviceName: "TestMonitor", status: "-" },
  { id: "DataFrame", serviceName: "DataFrame", status: "-" },
  {
    id: "AssetPerformanceManagement",
    serviceName: "AssetPerformanceManagement",
    status: "-",
  },
  { id: "Specification", serviceName: "Specification", status: "-" },
  { id: "FileIngestion", serviceName: "FileIngestion", status: "-" },
  { id: "SystemsState", serviceName: "SystemsState", status: "-" },
  {
    id: "SystemsManagement",
    serviceName: "SystemsManagement",
    status: "-",
  },
  {
    id: "WebAppServices",
    serviceName: "WebAppServices",
    status: "-",
  },
  { id: "JupyterHub", serviceName: "JupyterHub", status: "-" },
  { id: "Feeds", serviceName: "Feeds", status: "-" },
  { id: "Tags", serviceName: "Tags", status: "-" },
  { id: "Routines", serviceName: "Routines", status: "-" },
  { id: "WorkItem", serviceName: "WorkItem", status: "-" },
  { id: "ServiceRegistry", serviceName: "ServiceRegistry", status: "-" },
  { id: "DashboardHost", serviceName: "DashboardHost", status: "-" },
  { id: "NotebookExecution", serviceName: "NotebookExecution", status: "-" },
  { id: "AlarmService", serviceName: "AlarmService", status: "-" },
  { id: "Security", serviceName: "Security", status: "-" },
  { id: "Locations", serviceName: "Locations", status: "-" },
];

type ServiceStatusDetailsProps = {
  rows?: ServiceStatusRecord[];
};

const ServiceStatusDetail = ({
  rows = defaultServiceRows,
}: ServiceStatusDetailsProps) => {
  const tableRef = useRef<Table<ServiceStatusRecord> | null>(null);

  useEffect(() => {
    if (tableRef.current) {
      void tableRef.current.setData(rows);
    }
  }, [rows]);

  return (
    <section
      className="service-status-details"
      aria-label="Service status details"
    >
      <h2 className="service-status-details_title">Service Status Details</h2>
      <NimbleTable ref={fromTableRef(tableRef)} idFieldName="id">
        <NimbleTableColumnText fieldName="serviceName">
          Service Name
        </NimbleTableColumnText>
        <NimbleTableColumnText fieldName="status">Status</NimbleTableColumnText>
      </NimbleTable>
    </section>
  );
};

export default ServiceStatusDetail;
