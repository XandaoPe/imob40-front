// frontend/src/components/SuperAdminPanel.tsx
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ShieldAlert, Edit2, Save, X, Lock, Building2, User as UserIcon, Image as ImageIcon } from 'lucide-react';

export const SuperAdminPanel: React.FC = () => {
    const [data, setData] = useState<{ tenants: any[], users: any[], properties: any[] }>({ tenants: [], users: [], properties: [] });
    const [activeTab, setActiveTab] = useState<'tenants' | 'users' | 'properties'>('tenants');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    const fetchAllData = async () => {
        try {
            const res = await api.get('/super-admin/all-data');
            setData(res.data);
        } catch (err) {
            console.error('Erro ao buscar dados globais', err);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleEditClick = (item: any) => {
        setEditingId(item._id);
        setEditForm({
            ...item,
            whatsappContact: item.settings?.whatsappContact || ''
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSave = async (modelType: string, id: string) => {
        try {
            const payload = { ...editForm };
            if (modelType === 'tenant' && payload.whatsappContact !== undefined) {
                payload.settings = {
                    ...(payload.settings || {}),
                    whatsappContact: payload.whatsappContact
                };
            }
            await api.put(`/super-admin/${modelType}/${id}`, payload);
            setEditingId(null);
            setEditForm({});
            fetchAllData();
        } catch (err) {
            alert('Erro ao atualizar registro.');
        }
    };

    const translateStatus = (status: string) => {
        const map: Record<string, string> = {
            ACTIVE: 'Ativo',
            SUSPENDED: 'Suspenso',
            INACTIVE: 'Inativo',
            AVAILABLE: 'Disponível',
            RESERVED: 'Reservado',
            SOLD: 'Vendido'
        };
        return map[status] || status;
    };

    const translateRole = (role: string) => {
        const map: Record<string, string> = {
            SUPER_ADMIN: 'Super Administrador',
            ADMIN: 'Administrador',
            BROKER: 'Corretor'
        };
        return map[role] || role;
    };

    const translateType = (type: string) => {
        const map: Record<string, string> = {
            HOUSE: 'Casa',
            APARTMENT: 'Apartamento',
            LAND: 'Terreno',
            COMMERCIAL: 'Comercial'
        };
        return map[type] || type;
    };

    const translatePurpose = (purpose: string) => {
        const map: Record<string, string> = {
            SALE: 'Venda',
            RENT: 'Locação'
        };
        return map[purpose] || purpose;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto text-gray-100">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-2">
                        <ShieldAlert className="text-yellow-400" /> Painel Super Admin Global
                    </h1>
                    <p className="text-sm text-purple-200">Acesso total e editável a todas as imobiliárias, usuários e imóveis do sistema.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => { setActiveTab('tenants'); handleCancel(); }} className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'tenants' ? 'bg-white text-purple-900' : 'bg-purple-800'}`}>
                        Imobiliárias ({data.tenants.length})
                    </button>
                    <button onClick={() => { setActiveTab('users'); handleCancel(); }} className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'users' ? 'bg-white text-purple-900' : 'bg-purple-800'}`}>
                        Usuários ({data.users.length})
                    </button>
                    <button onClick={() => { setActiveTab('properties'); handleCancel(); }} className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'properties' ? 'bg-white text-purple-900' : 'bg-purple-800'}`}>
                        Imóveis ({data.properties.length})
                    </button>
                </div>
            </div>

            <div className="bg-gray-800 rounded-xl shadow border border-gray-700 overflow-x-auto p-4">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-700 text-gray-400">
                            <th className="p-3">Imagem / ID</th>
                            <th className="p-3">Identificação / Principal</th>
                            <th className="p-3">Detalhes e Campos Editáveis</th>
                            <th className="p-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeTab === 'tenants' && data.tenants.map(t => (
                            <tr key={t._id} className="border-b border-gray-700/50 hover:bg-gray-750 align-top">
                                <td className="p-3">
                                    {t.logoUrl ? (
                                        <img src={t.logoUrl} alt={t.tradeName} className="w-10 h-10 object-cover rounded border border-gray-700" />
                                    ) : (
                                        <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center text-gray-400">
                                            <Building2 size={20} />
                                        </div>
                                    )}
                                    <span className="font-mono text-[10px] text-gray-400 block mt-1">{t._id}</span>
                                </td>
                                <td className="p-3 font-bold">
                                    {editingId === t._id ? (
                                        <div className="space-y-2">
                                            <div>
                                                <label className="text-xs text-gray-400">Nome Fantasia:</label>
                                                <input value={editForm.tradeName || ''} onChange={e => setEditForm({ ...editForm, tradeName: e.target.value })} className="w-full bg-gray-900 border border-gray-700 p-1.5 rounded text-white" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400">Razão Social:</label>
                                                <input value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-gray-900 border border-gray-700 p-1.5 rounded text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="text-white font-bold">{t.tradeName}</div>
                                            <div className="text-xs text-gray-400">{t.name}</div>
                                        </div>
                                    )}
                                </td>
                                <td className="p-3 text-gray-300">
                                    {editingId === t._id ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-xs text-gray-400">CNPJ:</label>
                                                <input value={editForm.cnpj || ''} onChange={e => setEditForm({ ...editForm, cnpj: e.target.value })} className="w-full bg-gray-900 border border-gray-700 p-1.5 rounded text-white" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400">CRECI:</label>
                                                <input value={editForm.creci || ''} onChange={e => setEditForm({ ...editForm, creci: e.target.value })} className="w-full bg-gray-900 border border-gray-700 p-1.5 rounded text-white" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400">WhatsApp:</label>
                                                <input value={editForm.whatsappContact || ''} onChange={e => setEditForm({ ...editForm, whatsappContact: e.target.value })} className="w-full bg-gray-900 border border-gray-700 p-1.5 rounded text-white" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400">Status:</label>
                                                <select value={editForm.status || 'ACTIVE'} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full bg-gray-900 border border-gray-700 p-1.5 rounded text-white">
                                                    <option value="ACTIVE">Ativo</option>
                                                    <option value="SUSPENDED">Suspenso</option>
                                                    <option value="INACTIVE">Inativo</option>
                                                </select>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <div>CNPJ: {t.cnpj} | CRECI: {t.creci}</div>
                                            <div className="text-xs text-gray-400">WhatsApp: {t.settings?.whatsappContact} | Status: <span className="text-green-400">{translateStatus(t.status)}</span></div>
                                        </div>
                                    )}
                                </td>
                                <td className="p-3 text-right">
                                    {editingId === t._id ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleSave('tenant', t._id)} className="bg-green-600 p-2 rounded text-white hover:bg-green-700" title="Salvar"><Save size={16} /></button>
                                            <button onClick={handleCancel} className="bg-gray-600 p-2 rounded text-white hover:bg-gray-700" title="Cancelar"><X size={16} /></button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleEditClick(t)} className="bg-blue-600 p-2 rounded text-white hover:bg-blue-700" title="Editar"><Edit2 size={16} /></button>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {activeTab === 'users' && data.users.map(u => (
                            <tr key={u._id} className="border-b border-gray-700/50 hover:bg-gray-750 align-top">
                                <td className="p-3">
                                    {u.avatarUrl ? (
                                        <img src={u.avatarUrl} alt={u.name} className="w-10 h-10 object-cover rounded-full border border-gray-700" />
                                    ) : (
                                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-400">
                                            <UserIcon size={20} />
                                        </div>
                                    )}
                                    <span className="font-mono text-[10px] text-gray-400 block mt-1">{u._id}</span>
                                </td>
                                <td className="p-3 font-bold">
                                    {editingId === u._id ? (
                                        <div className="space-y-2">
                                            <div>
                                                <label className="text-xs text-gray-400">Nome:</label>
                                                <input value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-gray-900 border border-gray-700 p-1.5 rounded text-white" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400">E-mail:</label>
                                                <input value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full bg-gray-900 border border-gray-700 p-1.5 rounded text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="text-white font-bold">{u.name}</div>
                                            <div className="text-xs text-gray-400">{u.email}</div>
                                        </div>
                                    )}
                                </td>
                                <td className="p-3 text-gray-300">
                                    {editingId === u._id ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-xs text-gray-400">Telefone:</label>
                                                <input value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full bg-gray-900 border border-gray-700 p-1.5 rounded text-white" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400">CRECI:</label>
                                                <input value={editForm.creci || ''} onChange={e => setEditForm({ ...editForm, creci: e.target.value })} className="w-full bg-gray-900 border border-gray-700 p-1.5 rounded text-white" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400">Função (Role):</label>
                                                <select value={editForm.role || 'BROKER'} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="w-full bg-gray-900 border border-gray-700 p-1.5 rounded text-white">
                                                    <option value="SUPER_ADMIN">Super Administrador</option>
                                                    <option value="ADMIN">Administrador</option>
                                                    <option value="BROKER">Corretor</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400">Status:</label>
                                                <select value={editForm.status || 'ACTIVE'} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full bg-gray-900 border border-gray-700 p-1.5 rounded text-white">
                                                    <option value="ACTIVE">Ativo</option>
                                                    <option value="INACTIVE">Inativo</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400">Tenant ID:</label>
                                                <input value={editForm.tenantId || ''} onChange={e => setEditForm({ ...editForm, tenantId: e.target.value })} className="w-full bg-gray-900 border border-gray-700 p-1.5 rounded text-white font-mono text-xs" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-yellow-400 flex items-center gap-1"><Lock size={12} /> Nova Senha (Opcional):</label>
                                                <input type="password" placeholder="Deixe em branco p/ manter" value={editForm.password || ''} onChange={e => setEditForm({ ...editForm, password: e.target.value })} className="w-full bg-gray-900 border border-gray-700 p-1.5 rounded text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <div>Tel: {u.phone} | CRECI: {u.creci || 'N/A'} | Função: <span className="text-yellow-400 font-semibold">{translateRole(u.role)}</span></div>
                                            <div className="text-xs text-gray-400">Status: {translateStatus(u.status)} | Tenant ID: {u.tenantId || 'N/A'}</div>
                                        </div>
                                    )}
                                </td>
                                <td className="p-3 text-right">
                                    {editingId === u._id ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleSave('user', u._id)} className="bg-green-600 p-2 rounded text-white hover:bg-green-700" title="Salvar"><Save size={16} /></button>
                                            <button onClick={handleCancel} className="bg-gray-600 p-2 rounded text-white hover:bg-gray-700" title="Cancelar"><X size={16} /></button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleEditClick(u)} className="bg-blue-600 p-2 rounded text-white hover:bg-blue-700" title="Editar"><Edit2 size={16} /></button>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {activeTab === 'properties' && data.properties.map(p => {
                            const coverImg = p.images?.find((img: any) => img.isCover) || p.images?.[0];
                            return (
                                <tr key={p._id} className="border-b border-gray-700/50 hover:bg-gray-750 align-top">
                                    <td className="p-3">
                                        {coverImg?.url ? (
                                            <img src={coverImg.url} alt={p.title} className="w-10 h-10 object-cover rounded border border-gray-700" />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center text-gray-400">
                                                <ImageIcon size={20} />
                                            </div>
                                        )}
                                        <span className="font-mono text-[10px] text-gray-400 block mt-1">{p._id}</span>
                                    </td>
                                    <td className="p-3 font-bold">
                                        {editingId === p._id ? (
                                            <div className="space-y-2">
                                                <div>
                                                    <label className="text-xs text-gray-400">Título:</label>
                                                    <input value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="w-full bg-gray-900 border border-gray-700 p-1.5 rounded text-white" />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-400">Tipo:</label>
                                                    <select value={editForm.type || 'HOUSE'} onChange={e => setEditForm({ ...editForm, type: e.target.value })} className="w-full bg-gray-900 border border-gray-700 p-1.5 rounded text-white">
                                                        <option value="HOUSE">Casa</option>
                                                        <option value="APARTMENT">Apartamento</option>
                                                        <option value="LAND">Terreno</option>
                                                        <option value="COMMERCIAL">Comercial</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="text-white font-bold">{p.title}</div>
                                                <div className="text-xs text-gray-400">Tipo: {translateType(p.type)}</div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3 text-gray-300">
                                        {editingId === p._id ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                <div>
                                                    <label className="text-xs text-gray-400">Preço (R$):</label>
                                                    <input type="number" value={editForm.price || 0} onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })} className="w-full bg-gray-900 border border-gray-700 p-1.5 rounded text-white" />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-400">Finalidade:</label>
                                                    <select value={editForm.purpose || 'SALE'} onChange={e => setEditForm({ ...editForm, purpose: e.target.value })} className="w-full bg-gray-900 border border-gray-700 p-1.5 rounded text-white">
                                                        <option value="SALE">Venda</option>
                                                        <option value="RENT">Locação</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-400">Status:</label>
                                                    <select value={editForm.status || 'AVAILABLE'} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full bg-gray-900 border border-gray-700 p-1.5 rounded text-white">
                                                        <option value="AVAILABLE">Disponível</option>
                                                        <option value="RESERVED">Reservado</option>
                                                        <option value="SOLD">Vendido</option>
                                                        <option value="INACTIVE">Inativo</option>
                                                    </select>
                                                </div>
                                                <div className="sm:col-span-3">
                                                    <label className="text-xs text-gray-400">Descrição:</label>
                                                    <textarea rows={2} value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-full bg-gray-900 border border-gray-700 p-1.5 rounded text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <div>R$ {p.price?.toLocaleString('pt-BR')} | Finalidade: {translatePurpose(p.purpose)} | Status: <span className="text-blue-400">{translateStatus(p.status)}</span></div>
                                                <div className="text-xs text-gray-400 truncate max-w-md">{p.description}</div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3 text-right">
                                        {editingId === p._id ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleSave('property', p._id)} className="bg-green-600 p-2 rounded text-white hover:bg-green-700" title="Salvar"><Save size={16} /></button>
                                                <button onClick={handleCancel} className="bg-gray-600 p-2 rounded text-white hover:bg-gray-700" title="Cancelar"><X size={16} /></button>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleEditClick(p)} className="bg-blue-600 p-2 rounded text-white hover:bg-blue-700" title="Editar"><Edit2 size={16} /></button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};