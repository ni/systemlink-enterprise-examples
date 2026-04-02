import { type FormEvent, type JSX, useMemo, useState } from 'react';
import { NimbleButton } from '@ni/nimble-react/button';
import { NimbleTextField } from '@ni/nimble-react/text-field';
import { NimbleSelect } from '@ni/nimble-react/select';
import { NimbleListOption } from '@ni/nimble-react/list-option';
import '../../styles/AddUserService.scss';

interface UserServiceFormData {
    firstName: string;
    email: string;
    phone: string;
    role: string;
}

interface AddUserServiceProps {
    onAddUserService: (formData: UserServiceFormData) => void;
}

const AddUserService = ({
    onAddUserService,
}: AddUserServiceProps): JSX.Element => {
    const initialFormState = useMemo<UserServiceFormData>(
        () => ({
            firstName: '',
            email: '',
            phone: '',
            role: 'User',
        }),
        [],
    );

    const [formData, setFormData] = useState<UserServiceFormData>(initialFormState);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        onAddUserService(formData);
        setFormData(initialFormState);
        setIsOpen(false);
    };

    return (
        <>
            <NimbleButton
                className="add-user-service-trigger"
                onClick={() => {
                    setIsOpen(true);
                }}
            >
                Add User Service
            </NimbleButton>
            {isOpen ? (
                <div
                    className="add-user-service-overlay"
                    role="presentation"
                    onClick={() => {
                        setIsOpen(false);
                    }}
                >
                    <aside
                        className="add-user-service-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Add User Service"
                        onClick={event => {
                            event.stopPropagation();
                        }}
                    >
                        <h2 className="add-user-service-title">Add User Service</h2>
                        <form className="add-user-service-form" onSubmit={handleSubmit}>
                            <label className="add-user-service-label" htmlFor="name">
                                Name
                            </label>
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
                            />

                            <label className="add-user-service-label" htmlFor="email">
                                Email
                            </label>
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
                            />

                            <label className="add-user-service-label" htmlFor="phone">
                                Phone
                            </label>
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
                            />

                            <label className="add-user-service-label" htmlFor="role">
                                Role
                            </label>
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
                                <NimbleListOption value="User">User</NimbleListOption>
                                <NimbleListOption value="Manager">Manager</NimbleListOption>
                                <NimbleListOption value="Admin">Admin</NimbleListOption>
                            </NimbleSelect>

                            <div className="add-user-service-actions">
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

export { AddUserService };
