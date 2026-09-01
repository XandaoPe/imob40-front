// frontend/src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { UserPlus, Home, CheckCircle2 } from 'lucide-react';
import { BrokerForm } from '../components/BrokerForm';
import { PropertyForm } from '../components/PropertyForm';
import { ThemeToggle } from '../components/ThemeToggle';
import { TenantAuthProvider } from '../context/TenantAuthContext';
import { ThemeProvider } from '../context/ThemeContext';

export const AdminDashboardContent: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'broker' | 'property'>('property');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            setUser(parsed);
            if (parsed.role === 'BROKER') {
                setActiveTab('property');
            }
        }
    }, []);

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    const tenantId = user?.tenantId;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-800 dark:text-gray-100 transition-colors">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
                <div className="bg-blue-900 dark:bg-blue-950 p-6 text-white flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Painel Administrativo - CRM Multi-Tenant</h1>
                        <p className="text-sm text-blue-200">Gerencie corretores e imóveis da sua imobiliária.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {tenantId && (
                            <span className="bg-blue-800 dark:bg-blue-900 text-xs px-3 py-1 rounded-full border border-blue-700 font-mono">
                                Tenant ID: {tenantId}
                            </span>
                        )}
                        <ThemeToggle />
                    </div>
                </div>

                <div className="flex border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    {isAdmin && (
                        <button
                            onClick={() => {
                                setActiveTab('broker');
                                setSuccessMessage('');
                                setErrorMessage('');
                            }}
                            className={`flex-1 py-4 font-semibold text-center flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'broker'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                }`}
                        >
                            <UserPlus className="h-5 w-5" /> Cadastrar Corretor
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setActiveTab('property');
                            setSuccessMessage('');
                            setErrorMessage('');
                        }}
                        className={`flex-1 py-4 font-semibold text-center flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'property'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
                            }`}
                    >
                        <Home className="h-5 w-5" /> Cadastrar Imóvel
                    </button>
                </div>

                {successMessage && (
                    <div className="m-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                            <span>{successMessage}</span>
                        </div>
                        <button
                            onClick={() => setSuccessMessage('')}
                            className="text-green-700 dark:text-green-300 hover:opacity-75 text-xs font-semibold"
                        >
                            Fechar
                        </button>
                    </div>
                )}
                {errorMessage && (
                    <div className="m-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg flex items-center justify-between">
                        <span>{errorMessage}</span>
                        <button
                            onClick={() => setErrorMessage('')}
                            className="text-red-700 dark:text-red-300 hover:opacity-75 text-xs font-semibold"
                        >
                            Fechar
                        </button>
                    </div>
                )}

                <div className="p-6">
                    {isAdmin && activeTab === 'broker' && (
                        <BrokerForm
                            onSuccess={(msg) => {
                                setSuccessMessage(msg);
                                setErrorMessage('');
                            }}
                            onError={(err) => {
                                setErrorMessage(err);
                                setSuccessMessage('');
                            }}
                        />
                    )}

                    {activeTab === 'property' && (
                        <PropertyForm
                            onSuccess={(msg) => {
                                setSuccessMessage(msg);
                                setErrorMessage('');
                            }}
                            onError={(err) => {
                                setErrorMessage(err);
                                setSuccessMessage('');
                            }}
                            onClearMessages={() => {
                                if (successMessage) setSuccessMessage('');
                                if (errorMessage) setErrorMessage('');
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export const AdminDashboard: React.FC = () => {
    return (
        <ThemeProvider>
            <TenantAuthProvider>
                <AdminDashboardContent />
            </TenantAuthProvider>
        </ThemeProvider>
    );
};