import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { NimbleThemeProvider } from '@ni/nimble-react/theme-provider';
import { ServiceHealthDashboard } from './ServiceHealthDashboard';
import '../styles/main.scss';

import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/600.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <NimbleThemeProvider theme="light">
            <ServiceHealthDashboard />
        </NimbleThemeProvider>
    </StrictMode>,
);
