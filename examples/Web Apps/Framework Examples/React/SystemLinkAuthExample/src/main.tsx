import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { NimbleThemeProvider } from '@ni/nimble-react/theme-provider';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <NimbleThemeProvider theme="dark">
            <App />
        </NimbleThemeProvider>
    </StrictMode>,
);
