// frontend/src/components/SuperAdminPanel.tsx
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ShieldAlert, Edit2, Save, X, Lock, Building2, User as UserIcon, Image as ImageIcon } from 'lucide-react';
import { PropertyImageManager, PropertyImage } from './PropertyImageManager';

export const SuperAdminPanel: React.FC = () => {
    const [data, setData] = useState<{ tenants: any[], users: any[], properties: any[] }>({ tenants: [], users: [], properties: [] });
    const [activeTab, setActiveTab] = useState<'tenants' | 'users' | 'properties'>('tenants');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const triggerSuccess = (message: string) => {
        setSuccessMessage(message);
        setErrorMessage('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            setSuccessMessage('');
        }, 4000);
    };

    const triggerError = (msg: string) => {
        setErrorMessage(msg);
        setSuccessMessage('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            setErrorMessage('');
        }, 4000);
    };

    const fetchAllData = async () => {
        try {
            const res = await api.get('/super-admin/all-data');
            setData(res.data);
        } catch (err) {
            console.error('Erro ao buscar dados globais', err);
            triggerError('Erro ao carregar dados globais.');
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleEditClick = (item: any) => {
        setSuccessMessage('');
        setErrorMessage('');
        setEditingId(item._id);
        const normalizedImages = (item.images || []).map((img: any, idx: number) => ({
            url: img.url,
            isCover: img.isCover !== undefined ? img.isCover : (idx === 0),
            order: img.order !== undefined ? img.order : idx
        }));

        setEditForm({
            ...item,
            whatsappContact: item.settings?.whatsappContact || '',
            images: normalizedImages,
            avatarUrl: item.avatarUrl || ''
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({});
        setSuccessMessage('');
        setErrorMessage('');
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
            triggerSuccess('Registro atualizado com sucesso!');
            fetchAllData();
        } catch (err: any) {
            triggerError(err.response?.data?.error || 'Erro ao atualizar registro.');
        }
    };

    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 512;
                    const MAX_HEIGHT = 512;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.75));
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const compressedBase64 = await resizeImage(file);
            setEditForm({ ...editForm, avatarUrl: compressedBase64 });
        }
    };

    const translateStatus = (status: string) => {
        const map: Record<string, string> = {
            ACTIVE: 'Ativo',
            SUSPENDED: 'Suspenso',
            INACTIVE: 'Inativo',
            AVAILABLE: 'Disponível',
            RESERVED: 'Reservado',
            SOLD: 'Vendido',
            RENTED: 'Alugado'
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
            {successMessage && <div className="mb-4 p-3 bg-green-900/50 border border-green-700 text-green-200 rounded text-sm">{successMessage}</div>}
            {errorMessage && <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded text-sm">{errorMessage}</div>}

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
                                            <div className="text-xs text-gray-400">WhatsApp: {t.settings?.whatsappContact} | Status: <span className={t.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}>{translateStatus(t.status)}</span></div>
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
                                        <div className="space-y-4">
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

                                            <div className="border border-gray-700 p-3 rounded-lg bg-gray-900/50 space-y-2">
                                                <label className="text-xs font-bold text-purple-300 flex items-center gap-1">
                                                    <ImageIcon size={14} /> Foto de Perfil (Avatar)
                                                </label>
                                                {editForm.avatarUrl ? (
                                                    <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-700 group inline-block">
                                                        <img src={editForm.avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditForm({ ...editForm, avatarUrl: '' })}
                                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400 font-bold text-xs"
                                                        >
                                                            Remover
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-lg p-4 cursor-pointer bg-gray-900/30 transition-colors">
                                                        <ImageIcon size={24} className="text-gray-400 mb-1" />
                                                        <span className="text-xs text-gray-300 font-medium">Clique para selecionar a foto de perfil</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={handleAvatarFileChange}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <div>Tel: {u.phone} | CRECI: {u.creci || 'N/A'} | Função: <span className="text-yellow-400 font-semibold">{translateRole(u.role)}</span></div>
                                            <div className="text-xs text-gray-400">Status: <span className={u.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}>{translateStatus(u.status)}</span> | Tenant ID: {u.tenantId || 'N/A'}</div>
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
                                            <div className="space-y-4">
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
                                                            <option value="SOLD">Vendido</option>
                                                            <option value="RENTED">Alugado</option>
                                                            <option value="INACTIVE">Inativo</option>
                                                        </select>
                                                    </div>
                                                    <div className="sm:col-span-3">
                                                        <label className="text-xs text-gray-400">Descrição:</label>
                                                        <textarea rows={2} value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-full bg-gray-900 border border-gray-700 p-1.5 rounded text-white" />
                                                    </div>
                                                </div>

                                                <PropertyImageManager
                                                    images={editForm.images || []}
                                                    onChange={(images: PropertyImage[]) => setEditForm({ ...editForm, images })}
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <div>R$ {p.price?.toLocaleString('pt-BR')} | Finalidade: {translatePurpose(p.purpose)} | Status: <span className={p.status === 'AVAILABLE' ? 'text-green-400' : 'text-yellow-400'}>{translateStatus(p.status)}</span></div>
                                                <div className="text-xs text-gray-400 truncate max-w-md">{p.description}</div>
                                                <div className="text-[11px] text-purple-300">Imagens: {p.images?.length || 0} cadastrada(s)</div>
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