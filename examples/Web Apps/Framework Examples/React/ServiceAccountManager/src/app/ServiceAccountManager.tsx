import { type JSX } from 'react';
import { UserServiceTable } from './components/ServiceAccountTable';

const ServiceAccountManager = (): JSX.Element => {
    return (
        <>
            <UserServiceTable />
        </>
    );
};

export { ServiceAccountManager };
