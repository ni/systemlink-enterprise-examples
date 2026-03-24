import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ServiceHealthDashboard from './ServiceHealthDashboard';
import '../styles/main.scss';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ServiceHealthDashboard />
    </StrictMode>,
);
