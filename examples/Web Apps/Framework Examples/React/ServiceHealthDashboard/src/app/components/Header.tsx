import { useCallback, useEffect, useRef, useState, type JSX } from 'react';
import { NimbleButton } from '@ni/nimble-react/button';
import { NimbleCheckbox } from '@ni/nimble-react/checkbox';
import {
    defaultServiceRows,
    type ServiceStatusRecord,
} from './ServiceStatusData';
import '../../styles/Header.scss';

const systemLinkServerUrl = import.meta.env.VITE_SYSTEMLINK_SERVER_URL;

interface HeaderProps {
    onServicesLoaded: (
        rows: ServiceStatusRecord[],
        metadata: HealthCheckMetadata,
    ) => void;
}

export interface HealthCheckMetadata {
    lastChecked: Date;
    responseTimeMs: number;
    statusCode: number;
}

interface ServiceRegistryResponse {
    services: {
        name: string,
        status: string
    }[];
}

const Header = ({ onServicesLoaded }: HeaderProps): JSX.Element => {
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [isChecking, setIsChecking] = useState(false);
    const [checkError, setCheckError] = useState<string | null>(null);
    const isCheckingRef = useRef(false);

    const checkAllServices = useCallback(async (): Promise<void> => {
        if (isCheckingRef.current) {
            return;
        }

        isCheckingRef.current = true;
        setIsChecking(true);
        setCheckError(null);

        try {
            const start = performance.now();
            const response = await fetch(
                `${systemLinkServerUrl}/niserviceregistry/v1/services`,
                {
                    method: 'GET',
                    cache: 'no-store',
                },
            );

            const responseTimeMs = Math.round(performance.now() - start);

            if (response.status === 504) {
                const outageRows: ServiceStatusRecord[] = defaultServiceRows.map(
                    (row): ServiceStatusRecord => ({
                        ...row,
                        status: 'OUTAGE',
                    }),
                );

                onServicesLoaded(outageRows, {
                    lastChecked: new Date(),
                    responseTimeMs,
                    statusCode: response.status,
                });
                setCheckError(
                    'Service Registry API is currently unavailable (504 Gateway Timeout).',
                );
                return;
            }

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const result = (await response.json()) as ServiceRegistryResponse;

            if (!Array.isArray(result.services)) {
                throw new Error(
                    'Service Registry response did not include a valid services list.',
                );
            }

            const rows: ServiceStatusRecord[] = result.services.map(
                (service): ServiceStatusRecord => ({
                    id: service.name,
                    serviceName: service.name,
                    status: service.status,
                }),
            );

            onServicesLoaded(rows, {
                lastChecked: new Date(),
                responseTimeMs,
                statusCode: response.status,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setCheckError(`Failed to check services: ${errorMessage}`);
        } finally {
            isCheckingRef.current = false;
            setIsChecking(false);
        }
    }, [onServicesLoaded]);

    useEffect((): (() => void) | undefined => {
        if (!autoRefresh) {
            return undefined;
        }

        void checkAllServices();

        const intervalId = window.setInterval(() => {
            void checkAllServices();
        }, 30_000);

        return (): void => {
            window.clearInterval(intervalId);
        };
    }, [autoRefresh, checkAllServices]);

    return (
        <div>
            <header className="header">
                <div className="header_left">
                    <span className="header_logo" aria-hidden="true">
                        <svg
                            viewBox="0 0 24 24"
                            width="22"
                            height="22"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M2 13h5l2.1-7 3.3 12 2.7-8H22" />
                        </svg>
                    </span>
                    <h1 className="header_title">SystemLink Service Health Monitor</h1>
                </div>

                <></>

                <div className="header_right">
                    <label className="header_refresh">
                        <NimbleCheckbox
                            checked={autoRefresh}
                            onChange={e => setAutoRefresh((e.target as { checked: boolean }).checked)
                            }
                        >
                            Auto-refresh (30s)
                        </NimbleCheckbox>
                    </label>

                    <NimbleButton
                        appearance="outline"
                        onClick={() => {
                            void checkAllServices();
                        }}
                        disabled={isChecking}
                    >
                        <span
                            className={`header_button-icon ${isChecking ? 'is-spinning' : ''}`}
                            aria-hidden="true"
                        >
                            ↻
                        </span>
                        {isChecking ? 'Checking Services...' : 'Check All Services'}
                    </NimbleButton>

                    {checkError && <span>{checkError}</span>}
                </div>
            </header>
        </div>
    );
};

export { Header };
