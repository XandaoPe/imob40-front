// frontend/src/components/ClientManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useTenantAuth } from '../context/TenantAuthContext';
import {
    Users, UserPlus, Search, Phone, Mail, FileText, History,
    CheckCircle, XCircle, Edit, Trash2, Shield, Briefcase, MapPin, Building
} from 'lucide-react';

interface ClientHistoryItem {
    _id?: string;
    date: string;
    action: string;
    description: string;
    brokerName?: string;
}

interface Client {
    _id: string;
    name: string;
    email: string;
    phone: string;
    document: string;
    roles: ('BUYER' | 'SELLER')[];
    status: 'ACTIVE' | 'INACTIVE' | 'CLOSED_DEAL' | 'GAVE_UP';
    address?: {
        cep: string;
        street: string;
        number: string;
        neighborhood: string;
        city: string;
        state: string;
    };
    notes?: string;
    history: ClientHistoryItem[];
}

interface ClientManagementProps {
    onSuccess: (msg: string) => void;
    onError: (msg: string) => void;
}

export const ClientManagement: React.FC<ClientManagementProps> = ({ onSuccess, onError }) => {
    const { tenantId } = useTenantAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'ALL' | 'BUYER' | 'SELLER'>('ALL');
    const [showModal, setShowModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [editingClientId, setEditingClientId] = useState<string | null>(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
    const activeTenantId = tenantId || currentUser?.tenantId;
    const currentUserName = currentUser?.name || 'Administrador';

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        document: '',
        roles: ['BUYER'] as ('BUYER' | 'SELLER')[],
        status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'CLOSED_DEAL' | 'GAVE_UP',
        address: { cep: '', street: '', number: '', neighborhood: '', city: '', state: '' },
        notes: '',
        actionDescription: ''
    });

    const fetchClients = useCallback(async () => {
        if (!activeTenantId && !isSuperAdmin) return;
        try {
            const endpoint = isSuperAdmin ? '/clients/all' : `/clients/tenant/${activeTenantId}`;
            const res = await api.get(endpoint);
            setClients(res.data);
        } catch (err) {
            console.error('Erro ao buscar clientes', err);
            onError('Erro ao carregar lista de clientes.');
        }
    }, [activeTenantId, isSuperAdmin, onError]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    // Máscara de Telefone: (00) 00000-0000
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 6) {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        } else if (value.length > 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else if (value.length > 0) {
            value = `(${value}`;
        }
        setForm(prev => ({ ...prev, phone: value }));
    };

    // Máscara de CPF / CNPJ automático
    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 14) value = value.slice(0, 14);

        if (value.length <= 11) {
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        } else {
            value = value.replace(/^(\d{2})(\d)/, '$1.$2');
            value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
            value = value.replace(/(\d{4})(\d)/, '$1-$2');
        }
        setForm(prev => ({ ...prev, document: value }));
    };

    // CEP automático via ViaCEP
    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length === 8) {
            try {
                const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setForm(prev => ({
                        ...prev,
                        address: {
                            ...prev.address,
                            cep: e.target.value,
                            street: data.logradouro || '',
                            neighborhood: data.bairro || '',
                            city: data.localidade || '',
                            state: data.uf || ''
                        }
                    }));
                }
            } catch (err) {
                console.error('Erro ao buscar CEP', err);
            }
        }
    };

    const handleRoleToggle = (role: 'BUYER' | 'SELLER') => {
        setForm(prev => {
            const exists = prev.roles.includes(role);
            if (exists && prev.roles.length === 1) return prev; // Mantém pelo menos 1
            const updated = exists ? prev.roles.filter(r => r !== role) : [...prev.roles, role];
            return { ...prev, roles: updated };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                tenantId: activeTenantId,
                brokerName: currentUserName,
                actionDescription: editingClientId ? (form.actionDescription || 'Cadastro atualizado pelo painel') : 'Cliente cadastrado no sistema'
            };

            if (editingClientId) {
                await api.put(`/clients/${editingClientId}`, payload);
                onSuccess('Cliente/Vendedor atualizado com sucesso!');
            } else {
                await api.post('/clients', payload);
                onSuccess('Cliente/Vendedor cadastrado com sucesso!');
            }

            setShowModal(false);
            resetForm();
            fetchClients();
        } catch (err: any) {
            onError(err.response?.data?.error || 'Erro ao salvar registro.');
        }
    };

    const resetForm = () => {
        setEditingClientId(null);
        setForm({
            name: '',
            email: '',
            phone: '',
            document: '',
            roles: ['BUYER'],
            status: 'ACTIVE',
            address: { cep: '', street: '', number: '', neighborhood: '', city: '', state: '' },
            notes: '',
            actionDescription: ''
        });
    };

    const handleEdit = (client: Client) => {
        setEditingClientId(client._id);
        setForm({
            name: client.name || '',
            email: client.email || '',
            phone: client.phone || '',
            document: client.document || '',
            roles: client.roles || ['BUYER'],
            status: client.status || 'ACTIVE',
            address: client.address || { cep: '', street: '', number: '', neighborhood: '', city: '', state: '' },
            notes: client.notes || '',
            actionDescription: ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este cadastro e seu histórico?')) {
            try {
                await api.delete(`/clients/${id}`);
                onSuccess('Registro excluído com sucesso!');
                fetchClients();
            } catch (err) {
                onError('Erro ao excluir registro.');
            }
        }
    };

    const openHistory = (client: Client) => {
        setSelectedClient(client);
        setShowHistoryModal(true);
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch =
            client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.phone.includes(searchQuery) ||
            client.document?.includes(searchQuery);

        const matchesRole = roleFilter === 'ALL' || client.roles.includes(roleFilter);
        return matchesSearch && matchesRole;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <span className="bg-green-500/20 text-green-300 border border-green-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold">Ativo</span>;
            case 'CLOSED_DEAL': return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold">Negócio Fechado</span>;
            case 'GAVE_UP': return <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold">Desistiu</span>;
            default: return <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-[10px] font-bold">Inativo</span>;
        }
    };

    return (
        <div className="space-y-6 text-gray-100">
            {/* Header / Barra de Ações */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                <div>
                    <h2 className="text-xl font-black flex items-center gap-2">
                        <Users className="text-blue-500" /> Gestão de Clientes & Vendedores (CRM)
                    </h2>
                    <p className="text-sm text-gray-400">Banco de dados unificado com histórico completo de compras, aluguéis, propostas e status.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 transition shadow"
                >
                    <UserPlus className="w-5 h-5" /> Novo Cliente / Vendedor
                </button>
            </div>

            {/* Filtros e Busca */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-800/60 p-4 rounded-xl border border-gray-700">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, e-mail, telefone ou CPF..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 pl-10 pr-4 py-2 rounded-lg text-white text-sm focus:border-blue-500 outline-none"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-xs text-gray-400 font-semibold">Filtrar por:</span>
                    <button
                        onClick={() => setRoleFilter('ALL')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${roleFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-700'}`}
                    >
                        Todos ({clients.length})
                    </button>
                    <button
                        onClick={() => setRoleFilter('BUYER')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${roleFilter === 'BUYER' ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-700'}`}
                    >
                        Compradores
                    </button>
                    <button
                        onClick={() => setRoleFilter('SELLER')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${roleFilter === 'SELLER' ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-700'}`}
                    >
                        Vendedores
                    </button>
                </div>
            </div>

            {/* Lista / Tabela de Clientes */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-900/80 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-700">
                                <th className="p-4">Nome / Contato</th>
                                <th className="p-4">CPF / CNPJ</th>
                                <th className="p-4">Tipo (Papel)</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Histórico</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredClients.map(client => (
                                <tr key={client._id} className="hover:bg-gray-700/40 transition">
                                    <td className="p-4">
                                        <div className="font-bold text-white">{client.name}</div>
                                        <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                                            <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-blue-400" /> {client.email || 'N/D'}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-green-400" /> {client.phone}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-gray-300">
                                        {client.document || 'Não informado'}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-1.5 flex-wrap">
                                            {client.roles.map(role => (
                                                <span key={role} className={`px-2 py-0.5 rounded text-[10px] font-bold ${role === 'BUYER' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'}`}>
                                                    {role === 'BUYER' ? 'Comprador' : 'Vendedor'}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {getStatusBadge(client.status)}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => openHistory(client)}
                                            className="text-xs bg-blue-900/40 hover:bg-blue-900/80 text-blue-300 border border-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                                        >
                                            <History className="w-3.5 h-3.5" /> Ver Histórico ({client.history?.length || 0})
                                        </button>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEdit(client)} className="p-2 bg-blue-900/40 hover:bg-blue-900 text-blue-300 rounded-lg transition" title="Editar">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(client._id)} className="p-2 bg-red-900/40 hover:bg-red-900 text-red-300 rounded-lg transition" title="Excluir">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredClients.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-500 italic">
                                        Nenhum cliente ou vendedor encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Cadastro / Edição */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
                            <h3 className="font-bold text-base flex items-center gap-2">
                                <Users className="w-5 h-5" /> {editingClientId ? 'Editar Cadastro' : 'Novo Cliente / Vendedor'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-200">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Nome Completo / Razão Social *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: João da Silva"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">E-mail</label>
                                    <input
                                        type="email"
                                        placeholder="joao@email.com"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Telefone / WhatsApp *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="(11) 99999-9999"
                                        value={form.phone}
                                        onChange={handlePhoneChange}
                                        className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">CPF / CNPJ</label>
                                    <input
                                        type="text"
                                        placeholder="000.000.000-00 ou CNPJ"
                                        value={form.document}
                                        onChange={handleDocumentChange}
                                        className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Papel no Sistema (Selecione um ou ambos)</label>
                                    <div className="flex gap-3 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => handleRoleToggle('BUYER')}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${form.roles.includes('BUYER') ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400'}`}
                                        >
                                            Comprador
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRoleToggle('SELLER')}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${form.roles.includes('SELLER') ? 'bg-purple-600 border-purple-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400'}`}
                                        >
                                            Vendedor
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={e => setForm({ ...form, status: e.target.value as any })}
                                        className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white"
                                    >
                                        <option value="ACTIVE">Ativo (Em negociação/prospecção)</option>
                                        <option value="CLOSED_DEAL">Negócio Fechado (Comprou/Vendeu)</option>
                                        <option value="GAVE_UP">Desistiu</option>
                                        <option value="INACTIVE">Inativo</option>
                                    </select>
                                </div>
                            </div>

                            {/* Endereço */}
                            <div className="border border-gray-700 p-4 rounded-lg bg-gray-900/40 space-y-3">
                                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" /> Endereço do Cliente
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-400">CEP:</label>
                                        <input
                                            type="text"
                                            placeholder="00000-000"
                                            value={form.address.cep}
                                            onChange={e => setForm({ ...form, address: { ...form.address, cep: e.target.value } })}
                                            onBlur={handleCepBlur}
                                            className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white text-xs"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs text-gray-400">Logradouro (Rua/Av):</label>
                                        <input
                                            type="text"
                                            value={form.address.street}
                                            onChange={e => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
                                            className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400">Número:</label>
                                        <input
                                            type="text"
                                            value={form.address.number}
                                            onChange={e => setForm({ ...form, address: { ...form.address, number: e.target.value } })}
                                            className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400">Bairro:</label>
                                        <input
                                            type="text"
                                            value={form.address.neighborhood}
                                            onChange={e => setForm({ ...form, address: { ...form.address, neighborhood: e.target.value } })}
                                            className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400">Cidade / UF:</label>
                                        <input
                                            type="text"
                                            value={`${form.address.city || ''} ${form.address.state ? '/' + form.address.state : ''}`}
                                            readOnly
                                            className="w-full bg-gray-900/60 border border-gray-700 p-2 rounded text-gray-300 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1">Observações Gerais</label>
                                <textarea
                                    rows={2}
                                    placeholder="Preferências de imóveis, horários de contato..."
                                    value={form.notes}
                                    onChange={e => setForm({ ...form, notes: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white resize-none"
                                />
                            </div>

                            {editingClientId && (
                                <div>
                                    <label className="block text-xs font-semibold text-blue-400 mb-1">Motivo da Atualização / Nota no Histórico</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Alterou telefone de contato"
                                        value={form.actionDescription}
                                        onChange={e => setForm({ ...form, actionDescription: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" /> {editingClientId ? 'Salvar Alterações' : 'Cadastrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Histórico Detalhado */}
            {showHistoryModal && selectedClient && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden">
                        <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-base flex items-center gap-2">
                                    <History className="w-5 h-5" /> Histórico de {selectedClient.name}
                                </h3>
                                <p className="text-xs text-blue-200">Registro completo de interações, compras, aluguéis e status.</p>
                            </div>
                            <button onClick={() => setShowHistoryModal(false)} className="text-white hover:text-gray-200">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4 flex-1">
                            <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 text-xs space-y-1">
                                <div><strong className="text-gray-400">Telefone:</strong> {selectedClient.phone}</div>
                                <div><strong className="text-gray-400">E-mail:</strong> {selectedClient.email || 'Não informado'}</div>
                                <div><strong className="text-gray-400">CPF/CNPJ:</strong> {selectedClient.document || 'Não informado'}</div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Linha do Tempo</h4>
                                {selectedClient.history?.map((item, idx) => (
                                    <div key={idx} className="bg-gray-900 border border-gray-700 p-3 rounded-lg space-y-1 text-xs">
                                        <div className="flex justify-between items-center text-gray-400">
                                            <span className="font-bold text-blue-400">{item.action}</span>
                                            <span>{new Date(item.date).toLocaleString('pt-BR')}</span>
                                        </div>
                                        <p className="text-gray-200">{item.description}</p>
                                        {item.brokerName && (
                                            <div className="text-[10px] text-gray-500 pt-1 border-t border-gray-800">
                                                Registrado por: {item.brokerName}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {(!selectedClient.history || selectedClient.history.length === 0) && (
                                    <p className="text-gray-500 text-center py-6 text-xs italic">Nenhum evento registrado no histórico.</p>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-gray-900 border-t border-gray-700 flex justify-end">
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};