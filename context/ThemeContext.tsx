import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('custom-theme') as Theme;
        return savedTheme || 'light';
    });

    useEffect(() => {
        localStorage.setItem('custom-theme', theme);
        document.documentElement.classList.remove('custom-theme-dark', 'custom-theme-light');
        document.documentElement.classList.add(`custom-theme-${theme}`);
        document.body.classList.remove('custom-theme-dark', 'custom-theme-light');
        document.body.classList.add(`custom-theme-${theme}`);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('');
    }
    return context;
};