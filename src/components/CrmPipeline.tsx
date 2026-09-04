// frontend/src/components/CrmPipeline.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useTenantAuth } from '../context/TenantAuthContext';
import {
    Kanban, Plus, DollarSign, Calendar, User, Building,
    FileText, CheckCircle, XCircle, AlertCircle, Edit, Trash2, ChevronRight, Phone, Mail
} from 'lucide-react';

interface Deal {
    _id: string;
    propertyId: any;
    brokerId: any;
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

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
    const activeTenantId = tenantId || currentUser?.tenantId;
    const loggedUserId = currentUser?._id || currentUser?.id || '';

    const [form, setForm] = useState({
        propertyId: '',
        brokerId: loggedUserId,
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
        <div className="space-y-6 text-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                <div>
                    <h2 className="text-xl font-black flex items-center gap-2">
                        <Kanban className="text-blue-500" /> CRM de Vendas & Locações (Pipeline)
                    </h2>
                    <p className="text-sm text-gray-400">Gerenciamento completo de leads, visitas, propostas, comissões e fechamento de contratos.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 transition shadow"
                >
                    <Plus className="w-5 h-5" /> Novo Negócio / Lead
                </button>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 overflow-x-auto pb-4">
                {STAGES.map(stage => {
                    const stageDeals = deals.filter(d => d.stage === stage.key);
                    return (
                        <div key={stage.key} className="bg-gray-800 border border-gray-700 rounded-xl p-3 flex flex-col min-w-[260px] max-h-[75vh]">
                            <div className={`p-2 rounded-lg text-xs font-bold border mb-3 flex justify-between items-center ${stage.color}`}>
                                <span>{stage.label}</span>
                                <span className="bg-gray-900 px-2 py-0.5 rounded-full text-[11px]">{stageDeals.length}</span>
                            </div>

                            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                                {stageDeals.map(deal => {
                                    const prop = deal.propertyId;
                                    const broker = deal.brokerId;
                                    return (
                                        <div key={deal._id} className="bg-gray-900 border border-gray-700 hover:border-blue-500/50 p-3 rounded-lg shadow space-y-2 text-xs transition group">
                                            <div className="flex justify-between items-start font-bold text-gray-200">
                                                <span className="truncate flex-1" title={prop?.title || 'Imóvel'}>🏠 {prop?.title || 'Imóvel'}</span>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(deal)} className="p-1 bg-blue-900/50 text-blue-300 rounded hover:bg-blue-800" title="Editar"><Edit className="w-3 h-3" /></button>
                                                    <button onClick={() => handleDelete(deal._id)} className="p-1 bg-red-900/50 text-red-300 rounded hover:bg-red-800" title="Excluir"><Trash2 className="w-3 h-3" /></button>
                                                </div>
                                            </div>

                                            <div className="text-blue-400 font-mono font-semibold">
                                                R$ {deal.agreedPrice?.toLocaleString('pt-BR')} ({deal.type === 'SALE' ? 'Venda' : 'Locação'})
                                            </div>

                                            <div className="border-t border-gray-800 pt-1.5 space-y-1 text-gray-400">
                                                <div className="font-semibold text-gray-300 flex items-center gap-1">
                                                    <User className="w-3 h-3 text-purple-400" /> Cliente: {deal.clientName}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3 text-green-400" /> {deal.clientPhone}
                                                </div>
                                                <div className="text-[11px] text-gray-400">
                                                    Corretor: <span className="text-gray-200 font-medium">{broker?.name || 'Não atribuído'}</span>
                                                </div>
                                            </div>

                                            {deal.notes && (
                                                <p className="text-[11px] text-gray-400 italic bg-gray-800 p-1.5 rounded truncate">
                                                    Obs: {deal.notes}
                                                </p>
                                            )}

                                            <div className="flex justify-between items-center pt-2 border-t border-gray-800 text-[10px]">
                                                <span className="text-purple-300">Comissão: R$ {deal.commissionAmount?.toLocaleString('pt-BR')}</span>
                                                <select
                                                    value={deal.stage}
                                                    onChange={(e) => moveStage(deal._id, e.target.value)}
                                                    className="bg-gray-800 border border-gray-700 text-gray-200 rounded px-1.5 py-0.5 text-[10px]"
                                                >
                                                    {STAGES.map(s => (
                                                        <option key={s.key} value={s.key}>{s.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    );
                                })}
                                {stageDeals.length === 0 && (
                                    <p className="text-gray-500 text-center py-6 text-xs italic">Nenhum negócio aqui.</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Deal Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
                            <h3 className="font-bold text-base flex items-center gap-2">
                                <Kanban className="w-5 h-5" /> {editingDealId ? 'Editar Negócio CRM' : 'Cadastrar Novo Negócio CRM'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-200">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Imóvel Vinculado</label>
                                    <select
                                        required
                                        value={form.propertyId}
                                        onChange={e => setForm({ ...form, propertyId: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white"
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
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Corretor Responsável (Quem vendeu/alugou)</label>
                                    <select
                                        required
                                        value={form.brokerId}
                                        onChange={e => setForm({ ...form, brokerId: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white"
                                    >
                                        <option value="">Selecione o Corretor...</option>
                                        {brokers.map(b => (
                                            <option key={b._id} value={b._id}>
                                                {b.name} (CRECI: {b.creci || 'N/D'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Nome do Cliente (Comprador/Locatário)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: Carlos Alberto"
                                        value={form.clientName}
                                        onChange={e => setForm({ ...form, clientName: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">E-mail do Cliente</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="carlos@email.com"
                                        value={form.clientEmail}
                                        onChange={e => setForm({ ...form, clientEmail: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Telefone / WhatsApp</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="(11) 99999-9999"
                                        value={form.clientPhone}
                                        onChange={e => setForm({ ...form, clientPhone: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">CPF / CNPJ do Cliente</label>
                                    <input
                                        type="text"
                                        placeholder="000.000.000-00"
                                        value={form.clientDocument}
                                        onChange={handleDocumentChange}
                                        className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Finalidade</label>
                                    <select
                                        value={form.type}
                                        onChange={e => setForm({ ...form, type: e.target.value as 'SALE' | 'RENT' })}
                                        className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white"
                                    >
                                        <option value="SALE">Venda</option>
                                        <option value="RENT">Locação</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Estágio Atual (Pipeline)</label>
                                    <select
                                        value={form.stage}
                                        onChange={e => setForm({ ...form, stage: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white"
                                    >
                                        {STAGES.map(s => (
                                            <option key={s.key} value={s.key}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Valor Negociado / Fechado (R$)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="R$ 0,00"
                                        value={form.agreedPrice}
                                        onChange={handleAgreedPriceChange}
                                        className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white font-bold text-blue-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Taxa de Comissão (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={form.commissionRate}
                                        onChange={e => setForm({ ...form, commissionRate: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white"
                                    />
                                </div>
                            </div>

                            {form.type === 'RENT' && (
                                <div className="border border-gray-700 p-4 rounded-lg bg-gray-900/40 space-y-3">
                                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Detalhes da Locação</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-400">Duração (Meses):</label>
                                            <input type="number" value={form.rentalDetails.contractDurationMonths} onChange={e => setForm({ ...form, rentalDetails: { ...form.rentalDetails, contractDurationMonths: Number(e.target.value) } })} className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white text-xs" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400">Caução / Depósito (R$):</label>
                                            <input type="number" value={form.rentalDetails.depositAmount} onChange={e => setForm({ ...form, rentalDetails: { ...form.rentalDetails, depositAmount: Number(e.target.value) } })} className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white text-xs" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400">Garantia:</label>
                                            <select value={form.rentalDetails.guaranteeType} onChange={e => setForm({ ...form, rentalDetails: { ...form.rentalDetails, guaranteeType: e.target.value } })} className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white text-xs">
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
                                <div className="border border-gray-700 p-4 rounded-lg bg-gray-900/40 space-y-3">
                                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Detalhes da Venda</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-400">Forma de Pagamento:</label>
                                            <select value={form.saleDetails.paymentMethod} onChange={e => setForm({ ...form, saleDetails: { ...form.saleDetails, paymentMethod: e.target.value } })} className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white text-xs">
                                                <option value="AVISTA">À Vista</option>
                                                <option value="FINANCIAMENTO">Financiamento Bancário</option>
                                                <option value="PARCELADO">Parcelado Direto</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400">Número da Escritura / Matrícula:</label>
                                            <input type="text" placeholder="Ex: Matrícula 12.345" value={form.saleDetails.deedNumber} onChange={e => setForm({ ...form, saleDetails: { ...form.saleDetails, deedNumber: e.target.value } })} className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white text-xs" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1">Observações do Negócio</label>
                                <textarea
                                    rows={3}
                                    placeholder="Detalhes adicionais sobre a negociação..."
                                    value={form.notes}
                                    onChange={e => setForm({ ...form, notes: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white resize-none"
                                />
                            </div>

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
                                    <CheckCircle className="w-4 h-4" /> {editingDealId ? 'Salvar Alterações' : 'Cadastrar Negócio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};