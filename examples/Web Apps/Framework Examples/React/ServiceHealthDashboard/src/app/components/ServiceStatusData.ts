import type { TableRecord } from '@ni/nimble-react/table';

export interface ServiceStatusRecord extends TableRecord {
    id: string;
    serviceName: string;
    status: string;
}

export const defaultServiceRows: ServiceStatusRecord[] = [
    { id: 'Repository', serviceName: 'Repository', status: '-' },
    { id: 'TestMonitor', serviceName: 'TestMonitor', status: '-' },
    { id: 'DataFrame', serviceName: 'DataFrame', status: '-' },
    {
        id: 'AssetPerformanceManagement',
        serviceName: 'AssetPerformanceManagement',
        status: '-',
    },
    { id: 'Specification', serviceName: 'Specification', status: '-' },
    { id: 'FileIngestion', serviceName: 'FileIngestion', status: '-' },
    { id: 'SystemsState', serviceName: 'SystemsState', status: '-' },
    {
        id: 'SystemsManagement',
        serviceName: 'SystemsManagement',
        status: '-',
    },
    {
        id: 'WebAppServices',
        serviceName: 'WebAppServices',
        status: '-',
    },
    { id: 'JupyterHub', serviceName: 'JupyterHub', status: '-' },
    { id: 'Feeds', serviceName: 'Feeds', status: '-' },
    { id: 'Tags', serviceName: 'Tags', status: '-' },
    { id: 'Routines', serviceName: 'Routines', status: '-' },
    { id: 'WorkItem', serviceName: 'WorkItem', status: '-' },
    { id: 'ServiceRegistry', serviceName: 'ServiceRegistry', status: '-' },
    { id: 'DashboardHost', serviceName: 'DashboardHost', status: '-' },
    { id: 'NotebookExecution', serviceName: 'NotebookExecution', status: '-' },
    { id: 'AlarmService', serviceName: 'AlarmService', status: '-' },
    { id: 'Security', serviceName: 'Security', status: '-' },
    { id: 'Locations', serviceName: 'Locations', status: '-' },
];
