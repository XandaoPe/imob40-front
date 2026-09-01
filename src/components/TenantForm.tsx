import React, { useState } from 'react';
import { api } from '../services/api';
import { Tenant } from '../types';
import { useTenantAuth } from '../context/TenantAuthContext';

interface TenantFormProps {
    onSuccess: (message: string, tenantId: string, newTenant: Tenant) => void;
    onError: (msg: string) => void;
}

export const TenantForm: React.FC<TenantFormProps> = ({ onSuccess, onError }) => {
    const { setTenantId } = useTenantAuth();
    const [tenantForm, setTenantForm] = useState({
        name: '', tradeName: '', cnpj: '', creci: '', whatsappContact: '', logo: null as File | null
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', tenantForm.name);
            formData.append('tradeName', tenantForm.tradeName);
            formData.append('cnpj', tenantForm.cnpj);
            formData.append('creci', tenantForm.creci);
            formData.append('settings', JSON.stringify({ primaryColor: '#2563eb', whatsappContact: tenantForm.whatsappContact }));
            if (tenantForm.logo) formData.append('logo', tenantForm.logo);

            const response = await api.post('/tenants', formData);
            setTenantId(response.data._id);
            onSuccess(`Imobiliária cadastrada com sucesso! ID: ${response.data._id}`, response.data._id, response.data);
        } catch (error: any) {
            onError(error.response?.data?.error || 'Erro ao cadastrar imobiliária.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4">Cadastrar Nova Imobiliária</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Razão Social</label>
                    <input
                        type="text"
                        required
                        value={tenantForm.name}
                        onChange={e => setTenantForm({ ...tenantForm, name: e.target.value })}
                        className="w-full border dark:border-gray-700 p-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Ex: Imobiliária Exemplo LTDA"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Nome Fantasia</label>
                    <input
                        type="text"
                        required
                        value={tenantForm.tradeName}
                        onChange={e => setTenantForm({ ...tenantForm, tradeName: e.target.value })}
                        className="w-full border dark:border-gray-700 p-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Ex: Exemplo Imóveis"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">CNPJ</label>
                    <input
                        type="text"
                        required
                        value={tenantForm.cnpj}
                        onChange={e => setTenantForm({ ...tenantForm, cnpj: e.target.value })}
                        className="w-full border dark:border-gray-700 p-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="00.000.000/0001-00"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">CRECI Jurídico</label>
                    <input
                        type="text"
                        required
                        value={tenantForm.creci}
                        onChange={e => setTenantForm({ ...tenantForm, creci: e.target.value })}
                        className="w-full border dark:border-gray-700 p-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="12345-J"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">WhatsApp de Contato</label>
                    <input
                        type="text"
                        required
                        value={tenantForm.whatsappContact}
                        onChange={e => setTenantForm({ ...tenantForm, whatsappContact: e.target.value })}
                        className="w-full border dark:border-gray-700 p-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="11999999999"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Logotipo da Empresa</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setTenantForm({ ...tenantForm, logo: e.target.files?.[0] || null })}
                        className="w-full border dark:border-gray-700 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mt-4">
                Salvar Imobiliária
            </button>
        </form>
    );
};