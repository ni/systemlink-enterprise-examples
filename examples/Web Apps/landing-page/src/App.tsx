import { NimbleThemeProvider } from '@ni/nimble-react/theme-provider';
import './App.scss';

interface AppEntry {
    framework: string;
    app: string;
    path: string;
}

const appList: AppEntry[] = JSON.parse(
    import.meta.env.VITE_APP_LIST ?? '[]',
) as AppEntry[];

const frameworkGroups = appList.reduce<Record<string, AppEntry[]>>(
    (groups, entry) => {
        const group = groups[entry.framework] ?? [];
        group.push(entry);
        return { ...groups, [entry.framework]: group };
    },
    {},
);

export function App(): React.JSX.Element {
    return (
        <NimbleThemeProvider>
            <div className="page">
                <header className="page-header">
                    <h1 className="page-title">SystemLink Enterprise Examples</h1>
                    <p className="page-subtitle">
                        A collection of example applications demonstrating SystemLink
                        integrations across different frameworks.
                    </p>
                </header>
                <main className="content">
                    {Object.entries(frameworkGroups).map(([framework, apps]) => (
                        <section key={framework} className="framework-section">
                            <h2 className="framework-title">{framework}</h2>
                            <div className="app-grid">
                                {apps.map(entry => (
                                    <a
                                        key={entry.app}
                                        href={entry.path}
                                        className="app-card"
                                    >
                                        <span className="app-name">{entry.app}</span>
                                    </a>
                                ))}
                            </div>
                        </section>
                    ))}
                </main>
            </div>
        </NimbleThemeProvider>
    );
}
