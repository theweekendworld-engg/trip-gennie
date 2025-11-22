export function ThemeScript() {
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `
                (function() {
                    try {
                        const theme = localStorage.getItem('theme') || 'system';
                        const root = document.documentElement;
                        root.classList.remove('light', 'dark');
                        
                        if (theme === 'system') {
                            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                            root.classList.add(systemTheme);
                        } else {
                            root.classList.add(theme);
                        }
                    } catch (e) {}
                })();
                `,
            }}
        />
    );
}

