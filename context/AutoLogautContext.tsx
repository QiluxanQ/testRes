
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AutoLogoutContextType {
    autoLogout: boolean;
    setAutoLogout: (value: boolean) => void;
}

const AutoLogoutContext = createContext<AutoLogoutContextType | undefined>(undefined);

export function AutoLogoutProvider({ children }: { children: ReactNode }) {
    const [autoLogout, setAutoLogoutState] = useState<boolean>(() => {
        const saved = localStorage.getItem('autoLogout');
        return saved !== "false";
    });

    const setAutoLogout = (value: boolean) => {
        setAutoLogoutState(value);
        localStorage.setItem('autoLogout', value.toString());
    };

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'autoLogout') {
                setAutoLogoutState(e.newValue === "true");
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <AutoLogoutContext.Provider value={{ autoLogout, setAutoLogout }}>
            {children}
        </AutoLogoutContext.Provider>
    );
}

export function useAutoLogout() {
    const context = useContext(AutoLogoutContext);
    if (context === undefined) {
        throw new Error('useAutoLogout');
    }
    return context;
}