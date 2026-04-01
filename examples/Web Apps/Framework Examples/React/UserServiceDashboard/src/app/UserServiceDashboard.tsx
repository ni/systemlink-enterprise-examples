import { type JSX } from 'react';
import { UserServiceTable } from './components/UserServiceTable';

const UserServiceDashboard = (): JSX.Element => {
    return (
        <>
            <UserServiceTable />
        </>
    );
};

export { UserServiceDashboard };
