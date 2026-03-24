import type { JSX } from 'react';
import { useEffect, useRef } from 'react';
import { NimbleTable, fromTableRef, type Table } from '@ni/nimble-react/table';
import { NimbleTableColumnText } from '@ni/nimble-react/table-column/text';
import {
    defaultServiceRows,
    type ServiceStatusRecord,
} from './ServiceStatusData';
import '../../styles/ServiceStatusDetails.scss';

interface ServiceStatusDetailsProps {
    rows?: ServiceStatusRecord[];
}

const ServiceStatusDetail = ({
    rows = defaultServiceRows,
}: ServiceStatusDetailsProps): JSX.Element => {
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

export { ServiceStatusDetail };
