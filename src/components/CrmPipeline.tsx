// frontend/src/components/CrmPipeline.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useTenantAuth } from '../context/TenantAuthContext';
import {
    Kanban, Plus, DollarSign, Calendar, User, Building,
    FileText, CheckCircle, XCircle, AlertCircle, Edit, Trash2, ChevronRight, Phone, Mail, UserPlus, Search
} from 'lucide-react';

interface Deal {
    _id: string;
    propertyId: any;
    brokerId: any;
    clientId?: any;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    clientDocument: string;
    type: 'SALE' | 'RENT';
    stage: 'PROSPECTING' | 'VISIT' | 'PROPOSAL' | 'NEGOTIATION' | 'CONTRACT' | 'CLOSED_WON' | 'CLOSED_LOST';
    agreedPrice: number;
    commissionRate: number;
    commissionAmount: number;
    brokerCommissionAmount: number;
    closingDate?: string;
    notes?: string;
}

const STAGES = [
    { key: 'PROSPECTING', label: 'Prospecção', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    { key: 'VISIT', label: 'Visita Realizada', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
    { key: 'PROPOSAL', label: 'Proposta', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
    { key: 'NEGOTIATION', label: 'Negociação', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
    { key: 'CONTRACT', label: 'Contrato', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    { key: 'CLOSED_WON', label: 'Fechado (Ganho)', color: 'bg-green-500/20 text-green-300 border-green-500/40' },
    { key: 'CLOSED_LOST', label: 'Perdido', color: 'bg-red-500/20 text-red-300 border-red-500/40' },
];

interface CrmPipelineProps {
    onSuccess: (msg: string) => void;
    onError: (msg: string) => void;
}

export const CrmPipeline: React.FC<CrmPipelineProps> = ({ onSuccess, onError }) => {
    const { tenantId } = useTenantAuth();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [brokers, setBrokers] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingDealId, setEditingDealId] = useState<string | null>(null);

    // Estados para Autocomplete de Clientes
    const [clientSuggestions, setClientSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showQuickClientModal, setShowQuickClientModal] = useState(false);
    const [quickClientForm, setQuickClientForm] = useState({
        name: '',
        email: '',
        phone: '',
        document: ''
    });

    const suggestionRef = useRef<HTMLDivElement>(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
    const activeTenantId = tenantId || currentUser?.tenantId;
    const loggedUserId = currentUser?._id || currentUser?.id || '';
    const currentUserName = currentUser?.name || 'Administrador';

    const [form, setForm] = useState({
        propertyId: '',
        brokerId: loggedUserId,
        clientId: '',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientDocument: '',
        type: 'SALE' as 'SALE' | 'RENT',
        stage: 'PROSPECTING',
        agreedPrice: '',
        commissionRate: '6',
        notes: '',
        rentalDetails: { contractDurationMonths: 12, depositAmount: 0, guaranteeType: 'FIADOR' },
        saleDetails: { paymentMethod: 'AVISTA', deedNumber: '' }
    });

    const fetchData = useCallback(async () => {
        if (!activeTenantId && !isSuperAdmin) return;
        try {
            const dealEndpoint = isSuperAdmin ? '/crm/all' : `/crm/tenant/${activeTenantId}`;
            const propEndpoint = isSuperAdmin ? '/properties/tenant/all?role=SUPER_ADMIN' : `/properties/tenant/${activeTenantId}`;
            const brokerEndpoint = isSuperAdmin ? '/users/tenant/all' : `/users/tenant/${activeTenantId}`;

            const [dealsRes, propsRes, brokersRes] = await Promise.all([
                api.get(dealEndpoint),
                api.get(propEndpoint),
                api.get(brokerEndpoint)
            ]);

            setDeals(dealsRes.data);
            setProperties(propsRes.data);
            setBrokers(brokersRes.data);
        } catch (err) {
            console.error('Erro ao carregar dados do CRM', err);
        }
    }, [activeTenantId, isSuperAdmin]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Fechar sugestões ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Buscar clientes letra por letra para autocomplete
    const handleClientNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setForm(prev => ({ ...prev, clientName: val, clientId: '' }));

        if (val.trim().length >= 2) {
            try {
                const res = await api.get(`/clients/search?tenantId=${activeTenantId}&q=${encodeURIComponent(val)}`);
                setClientSuggestions(res.data);
                setShowSuggestions(true);
            } catch (err) {
                console.error('Erro ao buscar clientes para autocomplete', err);
            }
        } else {
            setClientSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelectClient = (client: any) => {
        setForm(prev => ({
            ...prev,
            clientId: client._id,
            clientName: client.name,
            clientEmail: client.email || '',
            clientPhone: client.phone || '',
            clientDocument: client.document || ''
        }));
        setShowSuggestions(false);
    };

    // Cadastro rápido de cliente sem sair da tela do CRM
    const handleQuickClientSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...quickClientForm,
                tenantId: activeTenantId,
                roles: ['BUYER'],
                status: 'ACTIVE',
                brokerName: currentUserName,
                actionDescription: 'Cadastrado rapidamente pelo CRM'
            };
            const res = await api.post('/clients', payload);
            const newClient = res.data;

            // Seleciona automaticamente o cliente recém criado no formulário do deal
            handleSelectClient(newClient);
            setShowQuickClientModal(false);
            setQuickClientForm({ name: '', email: '', phone: '', document: '' });
            onSuccess('Cliente cadastrado com sucesso!');
        } catch (err: any) {
            onError(err.response?.data?.error || 'Erro ao cadastrar cliente rápido.');
        }
    };

    const handleAgreedPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value) {
            const numberVal = (Number(value) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            setForm(prev => ({ ...prev, agreedPrice: numberVal }));
        } else {
            setForm(prev => ({ ...prev, agreedPrice: '' }));
        }
    };

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
        setForm(prev => ({ ...prev, clientDocument: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const cleanPrice = Number(form.agreedPrice.replace(/[^\d]/g, '')) / 100 || Number(form.agreedPrice);
            const payload = {
                ...form,
                tenantId: activeTenantId,
                agreedPrice: cleanPrice,
                commissionRate: Number(form.commissionRate)
            };

            if (editingDealId) {
                await api.put(`/crm/${editingDealId}`, payload);
                onSuccess('Negócio atualizado com sucesso no CRM!');
            } else {
                await api.post('/crm', payload);
                onSuccess('Negócio cadastrado no CRM com sucesso!');
            }

            setShowModal(false);
            resetForm();
            fetchData();
        } catch (err: any) {
            onError(err.response?.data?.error || 'Erro ao salvar negócio.');
        }
    };

    const resetForm = () => {
        setEditingDealId(null);
        setForm({
            propertyId: '',
            brokerId: loggedUserId,
            clientId: '',
            clientName: '',
            clientEmail: '',
            clientPhone: '',
            clientDocument: '',
            type: 'SALE',
            stage: 'PROSPECTING',
            agreedPrice: '',
            commissionRate: '6',
            notes: '',
            rentalDetails: { contractDurationMonths: 12, depositAmount: 0, guaranteeType: 'FIADOR' },
            saleDetails: { paymentMethod: 'AVISTA', deedNumber: '' }
        });
    };

    const handleEdit = (deal: Deal) => {
        setEditingDealId(deal._id);
        const formattedPrice = deal.agreedPrice ? deal.agreedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '';
        setForm({
            propertyId: deal.propertyId?._id || deal.propertyId,
            brokerId: deal.brokerId?._id || deal.brokerId,
            clientId: deal.clientId?._id || deal.clientId || '',
            clientName: deal.clientName || '',
            clientEmail: deal.clientEmail || '',
            clientPhone: deal.clientPhone || '',
            clientDocument: deal.clientDocument || '',
            type: deal.type || 'SALE',
            stage: deal.stage || 'PROSPECTING',
            agreedPrice: formattedPrice,
            commissionRate: deal.commissionRate?.toString() || '6',
            notes: deal.notes || '',
            rentalDetails: (deal as any).rentalDetails || { contractDurationMonths: 12, depositAmount: 0, guaranteeType: 'FIADOR' },
            saleDetails: (deal as any).saleDetails || { paymentMethod: 'AVISTA', deedNumber: '' }
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este negócio do CRM?')) {
            try {
                await api.delete(`/crm/${id}`);
                onSuccess('Negócio excluído com sucesso!');
                fetchData();
            } catch (err: any) {
                onError('Erro ao excluir negócio.');
            }
        }
    };

    const moveStage = async (dealId: string, nextStage: string) => {
        try {
            await api.put(`/crm/${dealId}`, { stage: nextStage });
            onSuccess('Estágio do negócio atualizado!');
            fetchData();
        } catch (err) {
            onError('Erro ao mover estágio.');
        }
    };

    return (
        <div className="space-y-6 text-gray-100 max-w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-800/90 backdrop-blur p-6 rounded-2xl border border-gray-700/80 shadow-xl">
                <div>
                    <h2 className="text-xl font-black flex items-center gap-2.5 text-white">
                        <Kanban className="text-blue-500 w-6 h-6" /> CRM de Vendas & Locações (Pipeline)
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">Gerenciamento profissional de leads, visitas, propostas, comissões e fechamento de contratos.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] shrink-0"
                >
                    <Plus className="w-5 h-5" /> Novo Negócio / Lead
                </button>
            </div>

            {/* Kanban Board Container with Horizontal Scroll */}
            <div className="w-full overflow-x-auto pb-6 pt-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900/50">
                <div className="inline-flex gap-5 items-start min-w-full px-1">
                    {STAGES.map(stage => {
                        const stageDeals = deals.filter(d => d.stage === stage.key);
                        return (
                            <div
                                key={stage.key}
                                className="bg-gray-800/90 backdrop-blur border border-gray-700/80 rounded-2xl p-4 flex flex-col w-[320px] min-w-[320px] max-h-[78vh] shadow-xl shrink-0"
                            >
                                <div className={`p-2.5 rounded-xl text-xs font-bold border mb-4 flex justify-between items-center ${stage.color}`}>
                                    <span className="tracking-wide uppercase">{stage.label}</span>
                                    <span className="bg-gray-900/80 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold shadow-inner">{stageDeals.length}</span>
                                </div>

                                <div className="space-y-3.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                                    {stageDeals.map(deal => {
                                        const prop = deal.propertyId;
                                        const broker = deal.brokerId;
                                        return (
                                            <div
                                                key={deal._id}
                                                className="bg-gray-900/95 border border-gray-700/70 hover:border-blue-500/60 p-4 rounded-xl shadow-lg space-y-3 text-xs transition-all duration-200 group relative hover:shadow-blue-500/10"
                                            >
                                                <div className="flex justify-between items-start gap-2">
                                                    <span className="font-bold text-gray-100 truncate flex-1 text-sm flex items-center gap-1.5" title={prop?.title || 'Imóvel'}>
                                                        <Building className="w-4 h-4 text-blue-400 shrink-0" />
                                                        <span className="truncate">{prop?.title || 'Imóvel'}</span>
                                                    </span>
                                                    <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                        <button
                                                            onClick={() => handleEdit(deal)}
                                                            className="p-1.5 bg-blue-900/50 hover:bg-blue-800 text-blue-300 rounded-lg transition"
                                                            title="Editar"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(deal._id)}
                                                            className="p-1.5 bg-red-900/50 hover:bg-red-800 text-red-300 rounded-lg transition"
                                                            title="Excluir"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="text-blue-400 font-mono font-bold text-sm bg-blue-950/40 p-2 rounded-lg border border-blue-900/40 flex justify-between items-center">
                                                    <span>R$ {deal.agreedPrice?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-200 font-sans">
                                                        {deal.type === 'SALE' ? 'Venda' : 'Locação'}
                                                    </span>
                                                </div>

                                                <div className="border-t border-gray-800 pt-2.5 space-y-1.5 text-gray-300">
                                                    <div className="font-semibold text-gray-200 flex items-center gap-1.5 truncate" title={deal.clientName}>
                                                        <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                                        <span className="truncate">Cliente: {deal.clientName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-400">
                                                        <Phone className="w-3.5 h-3.5 text-green-400 shrink-0" />
                                                        <span className="truncate">{deal.clientPhone || 'Não informado'}</span>
                                                    </div>
                                                    <div className="text-[11px] text-gray-400 truncate pt-0.5">
                                                        Corretor: <span className="text-gray-200 font-medium">{broker?.name || 'Não atribuído'}</span>
                                                    </div>
                                                </div>

                                                {deal.notes && (
                                                    <p className="text-[11px] text-gray-400 italic bg-gray-800/80 p-2 rounded-lg border border-gray-700/40 line-clamp-2" title={deal.notes}>
                                                        Obs: {deal.notes}
                                                    </p>
                                                )}

                                                <div className="flex flex-col gap-2 pt-2.5 border-t border-gray-800 text-[11px]">
                                                    <div className="flex justify-between items-center text-purple-300 font-mono">
                                                        <span>Comissão:</span>
                                                        <span className="font-bold">R$ {deal.commissionAmount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-400 text-[10px] uppercase font-semibold shrink-0">Mover:</span>
                                                        <select
                                                            value={deal.stage}
                                                            onChange={(e) => moveStage(deal._id, e.target.value)}
                                                            className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-2 py-1.5 text-xs font-medium focus:ring-2 focus:ring-blue-500/50 outline-none transition"
                                                        >
                                                            {STAGES.map(s => (
                                                                <option key={s.key} value={s.key}>{s.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {stageDeals.length === 0 && (
                                        <div className="text-gray-500 text-center py-10 text-xs italic bg-gray-900/40 rounded-xl border border-dashed border-gray-800">
                                            Nenhum negócio nesta etapa.
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Deal Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-800 border border-gray-700/90 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 flex justify-between items-center border-b border-blue-800/50">
                            <h3 className="font-bold text-base flex items-center gap-2.5">
                                <Kanban className="w-5 h-5 text-blue-400" /> {editingDealId ? 'Editar Negócio CRM' : 'Cadastrar Novo Negócio CRM'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-300 hover:text-white transition">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-sm custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Imóvel Vinculado *</label>
                                    <select
                                        required
                                        value={form.propertyId}
                                        onChange={e => setForm({ ...form, propertyId: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    >
                                        <option value="">Selecione o Imóvel...</option>
                                        {properties.map(p => (
                                            <option key={p._id} value={p._id}>
                                                {p.title} - R$ {p.price?.toLocaleString('pt-BR')} ({p.purpose === 'SALE' ? 'Venda' : 'Locação'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Corretor Responsável *</label>
                                    <select
                                        required
                                        value={form.brokerId}
                                        onChange={e => setForm({ ...form, brokerId: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    >
                                        <option value="">Selecione o Corretor...</option>
                                        {brokers.map(b => (
                                            <option key={b._id} value={b._id}>
                                                {b.name} (CRECI: {b.creci || 'N/D'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Autocomplete do Cliente */}
                                <div className="relative md:col-span-2" ref={suggestionRef}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="block text-xs font-semibold text-gray-300">Nome do Cliente (Busca Automática) *</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowQuickClientModal(true)}
                                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold transition"
                                        >
                                            <UserPlus className="w-3.5 h-3.5" /> Cadastrar Cliente Rápido
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Digite o nome ou CPF para buscar na base..."
                                            value={form.clientName}
                                            onChange={handleClientNameChange}
                                            onFocus={() => { if (clientSuggestions.length > 0) setShowSuggestions(true); }}
                                            className="w-full bg-gray-900 border border-gray-700 pl-10 pr-4 py-3 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                        />
                                    </div>

                                    {/* Dropdown de Sugestões de Clientes */}
                                    {showSuggestions && clientSuggestions.length > 0 && (
                                        <div className="absolute z-50 left-0 right-0 mt-1 bg-gray-900 border border-blue-500/50 rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
                                            {clientSuggestions.map(client => (
                                                <div
                                                    key={client._id}
                                                    onClick={() => handleSelectClient(client)}
                                                    className="p-3 hover:bg-blue-900/40 cursor-pointer border-b border-gray-800 last:border-none text-xs transition flex flex-col gap-0.5"
                                                >
                                                    <div className="font-bold text-white text-sm">{client.name}</div>
                                                    <div className="text-gray-400 text-xs flex gap-3">
                                                        <span>📞 {client.phone}</span>
                                                        <span>•</span>
                                                        <span>✉️ {client.email || 'Sem e-mail'}</span>
                                                        <span>•</span>
                                                        <span className="font-mono">📄 {client.document || 'Sem CPF'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">E-mail do Cliente</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="carlos@email.com"
                                        value={form.clientEmail}
                                        onChange={e => setForm({ ...form, clientEmail: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Telefone / WhatsApp</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="(11) 99999-9999"
                                        value={form.clientPhone}
                                        onChange={e => setForm({ ...form, clientPhone: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">CPF / CNPJ do Cliente</label>
                                    <input
                                        type="text"
                                        placeholder="000.000.000-00"
                                        value={form.clientDocument}
                                        onChange={handleDocumentChange}
                                        className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Finalidade</label>
                                    <select
                                        value={form.type}
                                        onChange={e => setForm({ ...form, type: e.target.value as 'SALE' | 'RENT' })}
                                        className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    >
                                        <option value="SALE">Venda</option>
                                        <option value="RENT">Locação</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Estágio Atual (Pipeline)</label>
                                    <select
                                        value={form.stage}
                                        onChange={e => setForm({ ...form, stage: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    >
                                        {STAGES.map(s => (
                                            <option key={s.key} value={s.key}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Valor Negociado / Fechado (R$)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="R$ 0,00"
                                        value={form.agreedPrice}
                                        onChange={handleAgreedPriceChange}
                                        className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-white font-bold text-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Taxa de Comissão (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={form.commissionRate}
                                        onChange={e => setForm({ ...form, commissionRate: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    />
                                </div>
                            </div>

                            {form.type === 'RENT' && (
                                <div className="border border-gray-700 p-4 rounded-xl bg-gray-900/60 space-y-3">
                                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Detalhes da Locação</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Duração (Meses):</label>
                                            <input type="number" value={form.rentalDetails.contractDurationMonths} onChange={e => setForm({ ...form, rentalDetails: { ...form.rentalDetails, contractDurationMonths: Number(e.target.value) } })} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white text-xs" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Caução / Depósito (R$):</label>
                                            <input type="number" value={form.rentalDetails.depositAmount} onChange={e => setForm({ ...form, rentalDetails: { ...form.rentalDetails, depositAmount: Number(e.target.value) } })} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white text-xs" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Garantia:</label>
                                            <select value={form.rentalDetails.guaranteeType} onChange={e => setForm({ ...form, rentalDetails: { ...form.rentalDetails, guaranteeType: e.target.value } })} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white text-xs">
                                                <option value="FIADOR">Fiador</option>
                                                <option value="SEGURO_FIANCA">Seguro Fiança</option>
                                                <option value="CAUCAO">Caução</option>
                                                <option value="TITULO_CAPITALIZACAO">Título de Capitalização</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {form.type === 'SALE' && (
                                <div className="border border-gray-700 p-4 rounded-xl bg-gray-900/60 space-y-3">
                                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Detalhes da Venda</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Forma de Pagamento:</label>
                                            <select value={form.saleDetails.paymentMethod} onChange={e => setForm({ ...form, saleDetails: { ...form.saleDetails, paymentMethod: e.target.value } })} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white text-xs">
                                                <option value="AVISTA">À Vista</option>
                                                <option value="FINANCIAMENTO">Financiamento Bancário</option>
                                                <option value="PARCELADO">Parcelado Direto</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Número da Escritura / Matrícula:</label>
                                            <input type="text" placeholder="Ex: Matrícula 12.345" value={form.saleDetails.deedNumber} onChange={e => setForm({ ...form, saleDetails: { ...form.saleDetails, deedNumber: e.target.value } })} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white text-xs" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Observações do Negócio</label>
                                <textarea
                                    rows={3}
                                    placeholder="Detalhes adicionais sobre a negociação..."
                                    value={form.notes}
                                    onChange={e => setForm({ ...form, notes: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-white resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-5 py-2.5 rounded-xl transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-600/30"
                                >
                                    <CheckCircle className="w-4 h-4" /> {editingDealId ? 'Salvar Alterações' : 'Cadastrar Negócio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Cadastro Rápido de Cliente */}
            {showQuickClientModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 flex justify-between items-center border-b border-blue-800/50">
                            <h3 className="font-bold text-sm flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-blue-400" /> Cadastro Rápido de Cliente
                            </h3>
                            <button onClick={() => setShowQuickClientModal(false)} className="text-gray-300 hover:text-white transition">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleQuickClientSubmit} className="p-5 space-y-3.5 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-300 mb-1">Nome Completo *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Maria Oliveira"
                                    value={quickClientForm.name}
                                    onChange={e => setQuickClientForm({ ...quickClientForm, name: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-gray-300 mb-1">Telefone / WhatsApp *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="(11) 99999-9999"
                                    value={quickClientForm.phone}
                                    onChange={e => setQuickClientForm({ ...quickClientForm, phone: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-gray-300 mb-1">E-mail</label>
                                <input
                                    type="email"
                                    placeholder="maria@email.com"
                                    value={quickClientForm.email}
                                    onChange={e => setQuickClientForm({ ...quickClientForm, email: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-gray-300 mb-1">CPF / CNPJ</label>
                                <input
                                    type="text"
                                    placeholder="000.000.000-00"
                                    value={quickClientForm.document}
                                    onChange={e => setQuickClientForm({ ...quickClientForm, document: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-white focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setShowQuickClientModal(false)}
                                    className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2.5 rounded-xl transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
                                >
                                    <CheckCircle className="w-4 h-4" /> Salvar e Selecionar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};