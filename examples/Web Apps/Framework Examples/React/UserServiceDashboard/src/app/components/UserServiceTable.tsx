import type { JSX } from "react";
import { NimbleTable } from "@ni/nimble-react/table";
import { NimbleTableColumnText } from "@ni/nimble-react/table-column/text";
import "../../styles/UserServiceTable.scss";

const UserServiceTable = (): JSX.Element => {
  return (
    <section
      className="service-status-details"
      aria-label="Service status details"
    >
      <h2 className="service-status-details_title">Service Status Details</h2>
      <NimbleTable idFieldName="id">
        <NimbleTableColumnText fieldName="serviceName">
          Service Name
        </NimbleTableColumnText>
        <NimbleTableColumnText fieldName="status">Status</NimbleTableColumnText>
      </NimbleTable>
    </section>
  );
};

export { UserServiceTable };
