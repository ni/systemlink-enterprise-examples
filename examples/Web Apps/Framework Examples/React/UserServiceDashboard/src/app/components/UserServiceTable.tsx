import type { JSX } from 'react';
import { NimbleTable } from '@ni/nimble-react/table';
import { NimbleTableColumnText } from '@ni/nimble-react/table-column/text';
import { NimbleTableColumnMapping } from '@ni/nimble-react/table-column/mapping';
import { NimbleCheckbox } from '@ni/nimble-react/checkbox';

const UserServiceTable = (): JSX.Element => {
    return (
        <NimbleTable>
            <NimbleTableColumnText field-name="firstName" key-type="string">
                <NimbleCheckbox></NimbleCheckbox>
                Name
            </NimbleTableColumnText>
            <NimbleTableColumnMapping field-name="email" key-type="string">
                Email
            </NimbleTableColumnMapping>
            <NimbleTableColumnMapping field-name="phone" key-type="string">
                Phone
            </NimbleTableColumnMapping>
            <NimbleTableColumnMapping field-name="role" key-type="string">
                Role
            </NimbleTableColumnMapping>
        </NimbleTable>
    );
};

export { UserServiceTable };
