// frontend/src/context/TenantAuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface TenantAuthContextType {
    tenantId: string;
    setTenantId: (id: string) => void;
}

const TenantAuthContext = createContext<TenantAuthContextType>({
    tenantId: '',
    setTenantId: () => { },
});

export const TenantAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tenantId, setTenantId] = useState<string>('6a933cf0503244487c9164a7');

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                if (parsedUser && parsedUser.tenantId) {
                    setTenantId(parsedUser.tenantId);
                }
            } catch (e) {
                console.error("Erro ao ler usuário do localStorage", e);
            }
        }
    }, []);

    return (
        <TenantAuthContext.Provider value={{ tenantId, setTenantId }}>
            {children}
        </TenantAuthContext.Provider>
    );
};

export const useTenantAuth = () => useContext(TenantAuthContext);