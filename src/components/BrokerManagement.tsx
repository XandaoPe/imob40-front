import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Broker } from '../types';
import { useTenantAuth } from '../context/TenantAuthContext';
import { BrokerForm } from './BrokerForm';
import { BrokerList } from './BrokerList';

interface BrokerManagementProps {
    onSuccess: (message: string) => void;
    onError: (msg: string) => void;
    onClearMessages?: () => void;
}

export const BrokerManagement: React.FC<BrokerManagementProps> = ({
    onSuccess,
    onError,
    onClearMessages = () => { }
}) => {
    const { tenantId } = useTenantAuth();
    const [brokersList, setBrokersList] = useState<Broker[]>([]);
    const [editingBroker, setEditingBroker] = useState<Broker | null>(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
    const isAdmin = currentUser?.role === 'ADMIN' || isSuperAdmin;
    const activeTenantId = tenantId || currentUser?.tenantId;

    const fetchBrokers = useCallback(async () => {
        if (!activeTenantId && !isSuperAdmin) return;
        try {
            const endpoint = isSuperAdmin ? '/users/tenant/all' : `/users/tenant/${activeTenantId}`;
            const res = await api.get(endpoint);
            setBrokersList(res.data);
        } catch (err) {
            setBrokersList([]);
        }
    }, [activeTenantId, isSuperAdmin]);

    useEffect(() => {
        setBrokersList([]);
        if (activeTenantId || isSuperAdmin) {
            fetchBrokers();
        }
    }, [activeTenantId, isSuperAdmin, fetchBrokers]);

    const handleEdit = (broker: Broker) => {
        onClearMessages();
        setEditingBroker(broker);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este corretor?')) {
            try {
                await api.delete(`/users/${id}`);
                onSuccess('Corretor excluído com sucesso!');
                fetchBrokers();
            } catch (err: any) {
                onError(err.response?.data?.error || 'Erro ao excluir corretor.');
            }
        }
    };

    return (
        <div className="space-y-6">
            <BrokerForm
                onSuccess={(msg) => {
                    onSuccess(msg);
                    setEditingBroker(null);
                    fetchBrokers();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onError={onError}
                editingBroker={editingBroker}
                onCancelEdit={() => setEditingBroker(null)}
                onClearMessages={onClearMessages}
            />

            <hr className="my-4 border-gray-300 dark:border-gray-700" />

            <BrokerList
                brokersList={brokersList}
                isSuperAdmin={isSuperAdmin}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
};