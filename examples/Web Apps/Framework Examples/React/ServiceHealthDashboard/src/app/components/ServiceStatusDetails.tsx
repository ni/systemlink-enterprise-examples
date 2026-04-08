import type { JSX } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { NimbleTable, fromTableRef, type Table } from '@ni/nimble-react/table';
import { NimbleTableColumnText } from '@ni/nimble-react/table-column/text';
import { NimbleTableColumnMapping } from '@ni/nimble-react/table-column/mapping';
import { NimbleMappingIcon } from '@ni/nimble-react/mapping/icon';
import { iconCheckTag } from '@ni/nimble-react/icons/check';
import { iconXmarkTag } from '@ni/nimble-react/icons/xmark';
import {
    defaultServiceRows,
    type ServiceStatusRecord,
} from './ServiceStatusData';
import '../../styles/ServiceStatusDetails.scss';

interface ServiceStatusDetailsProps {
    rows?: ServiceStatusRecord[];
    apiStatusCode?: number;
}

interface ServiceStatusDisplayRecord extends ServiceStatusRecord {
    statusIconKey: string;
}

const ServiceStatusDetail = ({
    rows = defaultServiceRows,
    apiStatusCode,
}: ServiceStatusDetailsProps): JSX.Element => {
    const tableRef = useRef<Table<ServiceStatusDisplayRecord> | null>(null);
    const isApiStatusPending = typeof apiStatusCode !== 'number';
    const apiErrorKey = `HTTP_${String(apiStatusCode ?? 'ERROR')}`;
    const displayRows = useMemo<ServiceStatusDisplayRecord[]>(() => {
        if (isApiStatusPending) {
            return rows.map(row => ({
                ...row,
                statusIconKey: row.status,
            }));
        }

        if (apiStatusCode === 200) {
            return rows.map(row => ({
                ...row,
                statusIconKey:
          row.status.trim().toUpperCase() === 'LIVE' ? 'LIVE' : 'NOT_LIVE',
            }));
        }

        return rows.map(row => ({
            ...row,
            statusIconKey: apiErrorKey,
        }));
    }, [apiErrorKey, apiStatusCode, isApiStatusPending, rows]);

    useEffect(() => {
        if (tableRef.current) {
            void tableRef.current.setData(displayRows);
        }
    }, [displayRows]);

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
                <NimbleTableColumnMapping fieldName="statusIconKey">
                    Status
                    <NimbleMappingIcon
                        keyValue="LIVE"
                        icon={iconCheckTag}
                        severity="success"
                        text="LIVE"
                    ></NimbleMappingIcon>
                    <NimbleMappingIcon
                        keyValue="NOT_LIVE"
                        icon={iconXmarkTag}
                        severity="error"
                        text="STOPPED"
                    ></NimbleMappingIcon>
                    <NimbleMappingIcon
                        keyValue={apiErrorKey}
                        icon={iconXmarkTag}
                        severity="error"
                        text={`${String(apiStatusCode)}`}
                    ></NimbleMappingIcon>
                </NimbleTableColumnMapping>
            </NimbleTable>
        </section>
    );
};

export { ServiceStatusDetail };
