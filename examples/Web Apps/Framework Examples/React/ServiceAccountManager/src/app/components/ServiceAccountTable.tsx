import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
    fromTableRef,
    NimbleTable,
    type TableRecord,
} from '@ni/nimble-react/table';
import { NimbleTableColumnText } from '@ni/nimble-react/table-column/text';
import { AddUserService } from './AddServiceAccount';
import '../../styles/UserServiceTable.scss';

interface UserService extends TableRecord {
    id: string;
    firstName: string;
    email: string;
    phone: string;
    role: string;
}

interface UserServiceFormData {
    firstName: string;
    email: string;
    phone: string;
    role: string;
}

const fakeUserData: UserService[] = [
    {
        id: 'john.smith@example.com',
        firstName: 'John Smith',
        email: 'john.smith@example.com',
        phone: '(555) 123-4567',
        role: 'Admin',
    },
    {
        id: 'sarah.johnson@example.com',
        firstName: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '(555) 234-5678',
        role: 'User',
    },
    {
        id: 'mike.chen@example.com',
        firstName: 'Mike Chen',
        email: 'mike.chen@example.com',
        phone: '(555) 345-6789',
        role: 'Manager',
    },
    {
        id: 'emily.davis@example.com',
        firstName: 'Emily Davis',
        email: 'emily.davis@example.com',
        phone: '(555) 456-7890',
        role: 'User',
    },
];

const UserServiceTable = (): JSX.Element => {
    const tableRef = useRef<HTMLElementTagNameMap['nimble-table']>(null);
    const [userServices, setUserServices] = useState<UserService[]>(fakeUserData);

    useEffect(() => {
        if (tableRef.current) {
            void tableRef.current.setData(userServices);
        }
    }, [userServices]);

    const handleAddUserService = ({
        firstName,
        email,
        phone,
        role,
    }: UserServiceFormData): void => {
        setUserServices(currentUserServices => [
            ...currentUserServices,
            {
                id: email,
                firstName,
                email,
                phone,
                role,
            },
        ]);
    };

    return (
        <div className="user-service-table-wrapper">
            <AddUserService onAddUserService={handleAddUserService} />
            <NimbleTable
                ref={fromTableRef(tableRef)}
                id-field-name="id"
                selection-mode="multiple"
            >
                <NimbleTableColumnText field-name="firstName" key-type="string">
                    Name
                </NimbleTableColumnText>
                <NimbleTableColumnText field-name="email" key-type="string">
                    Email
                </NimbleTableColumnText>
                <NimbleTableColumnText field-name="phone" key-type="string">
                    Phone
                </NimbleTableColumnText>
                <NimbleTableColumnText field-name="role" key-type="string">
                    Role
                </NimbleTableColumnText>
            </NimbleTable>
        </div>
    );
};

export { UserServiceTable };
