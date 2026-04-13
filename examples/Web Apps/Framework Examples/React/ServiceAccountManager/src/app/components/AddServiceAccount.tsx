import { type FormEvent, type JSX, useMemo, useState } from 'react';
import { NimbleButton } from '@ni/nimble-react/button';
import { NimbleTextField } from '@ni/nimble-react/text-field';
import { NimbleSelect } from '@ni/nimble-react/select';
import { NimbleListOption } from '@ni/nimble-react/list-option';
import '../../styles/AddUserService.scss';

interface ServiceAccountFormData {
    firstName: string;
    email: string;
    phone: string;
    role: string;
}

interface AddServiceAccountProps {
    onAddUserService: (formData: ServiceAccountFormData) => void;
}

const AddServiceAccount = ({
    onAddUserService: onAddServiceAccount,
}: AddServiceAccountProps): JSX.Element => {
    const initialFormState = useMemo<ServiceAccountFormData>(
        () => ({
            firstName: '',
            email: '',
            phone: '',
            role: 'User',
        }),
        [],
    );

    const [formData, setFormData] = useState<ServiceAccountFormData>(initialFormState);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        onAddServiceAccount(formData);
        setFormData(initialFormState);
        setIsOpen(false);
    };

    return (
        <>
            <NimbleButton
                className="add-service-account-trigger"
                onClick={() => {
                    setIsOpen(true);
                }}
            >
                Add Service Account
            </NimbleButton>
            {isOpen ? (
                <div
                    className="add-service-account-overlay"
                    role="presentation"
                    onClick={() => {
                        setIsOpen(false);
                    }}
                >
                    <aside
                        className="add-service-account-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Add Service Account"
                        onClick={event => {
                            event.stopPropagation();
                        }}
                    >
                        <h2 className="add-service-account-title">Add Service Account</h2>
                        <form className="add-service-account-form" onSubmit={handleSubmit}>
                            <NimbleTextField
                                id="name"
                                value={formData.firstName}
                                onChange={event => {
                                    setFormData(currentFormData => ({
                                        ...currentFormData,
                                        firstName: event.target.value,
                                    }));
                                }}
                                required
                            >
                                Name
                            </NimbleTextField>

                            <NimbleTextField
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={event => {
                                    setFormData(currentFormData => ({
                                        ...currentFormData,
                                        email: event.target.value,
                                    }));
                                }}
                                required
                            >
                                Email
                            </NimbleTextField>

                            <NimbleTextField
                                id="phone"
                                value={formData.phone}
                                onChange={event => {
                                    setFormData(currentFormData => ({
                                        ...currentFormData,
                                        phone: event.target.value,
                                    }));
                                }}
                                required
                            >
                                Phone
                            </NimbleTextField>

                            <NimbleSelect
                                id="role"
                                value={formData.role}
                                onChange={event => {
                                    setFormData(currentFormData => ({
                                        ...currentFormData,
                                        role: event.target.value,
                                    }));
                                }}
                            >
                                Role
                                <NimbleListOption value="User">User</NimbleListOption>
                                <NimbleListOption value="Manager">Manager</NimbleListOption>
                                <NimbleListOption value="Admin">Admin</NimbleListOption>
                            </NimbleSelect>

                            <div className="add-service-account-actions">
                                <NimbleButton
                                    appearance="ghost"
                                    onClick={() => {
                                        setIsOpen(false);
                                    }}
                                    type="button"
                                >
                                    Cancel
                                </NimbleButton>
                                <NimbleButton type="submit">Add</NimbleButton>
                            </div>
                        </form>
                    </aside>
                </div>
            ) : null}
        </>
    );
};

export { AddServiceAccount as AddUserService };
