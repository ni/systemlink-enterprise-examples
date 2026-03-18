import { useCallback, useEffect, useRef, useState } from 'react';
import { NimbleButton } from '@ni/nimble-react/button';
import type { ServiceStatusRecord } from './ServiceStatusDetails';
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

const Header = ({ onServicesLoaded }: HeaderProps) => {
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [isChecking, setIsChecking] = useState(false);
    const [checkError, setCheckError] = useState<string | null>(null);
    const isCheckingRef = useRef(false);

    const checkAllServices = useCallback(async () => {
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

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const result = (await response.json()) as ServiceRegistryResponse;

            const rows: ServiceStatusRecord[] = result.services.map(service => ({
                id: service.name,
                serviceName: service.name,
                status: service.status,
            }));

            const responseTimeMs = Math.round(performance.now() - start);

            onServicesLoaded(rows, {
                lastChecked: new Date(),
                responseTimeMs,
                statusCode: response.status,
            });
        } catch (error) {
            console.error('Failed to check services:', error);
            setCheckError('Failed to check services.');
        } finally {
            isCheckingRef.current = false;
            setIsChecking(false);
        }
    }, [onServicesLoaded]);

    useEffect(() => {
        if (!autoRefresh) {
            return;
        }

        void checkAllServices();

        const intervalId = window.setInterval(() => {
            void checkAllServices();
        }, 30_000);

        return () => {
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

                <div className="header_right">
                    <label className="header_refresh">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={e => setAutoRefresh(e.target.checked)}
                        />
                        <span>Auto-refresh (30s)</span>
                    </label>

                    <NimbleButton
                        className="header_button"
                        appearance="block"
                        onClick={checkAllServices}
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

export default Header;
