import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { NimbleThemeProvider } from '@ni/nimble-react/theme-provider';
import { ServiceAccountManager } from './ServiceAccountManager';
import '../styles/main.scss';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <NimbleThemeProvider theme="light">
            <div className="app-wrapper">
                <ServiceAccountManager />
            </div>
        </NimbleThemeProvider>
    </StrictMode>,
);
