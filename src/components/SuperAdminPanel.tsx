import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ShieldAlert, Edit2, Save, Database } from 'lucide-react';

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
        setEditForm({ ...item });
    };

    const handleSave = async (modelType: string, id: string) => {
        try {
            await api.put(`/super-admin/${modelType}/${id}`, editForm);
            setEditingId(null);
            fetchAllData();
        } catch (err) {
            alert('Erro ao atualizar registro.');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto text-gray-100">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 rounded-xl shadow-lg flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-2">
                        <ShieldAlert className="text-yellow-400" /> Painel Super Admin Global
                    </h1>
                    <p className="text-sm text-purple-200">Acesso total a todas as imobiliárias, usuários e imóveis do sistema.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('tenants')} className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'tenants' ? 'bg-white text-purple-900' : 'bg-purple-800'}`}>
                        Tenants ({data.tenants.length})
                    </button>
                    <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'users' ? 'bg-white text-purple-900' : 'bg-purple-800'}`}>
                        Usuários ({data.users.length})
                    </button>
                    <button onClick={() => setActiveTab('properties')} className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'properties' ? 'bg-white text-purple-900' : 'bg-purple-800'}`}>
                        Imóveis ({data.properties.length})
                    </button>
                </div>
            </div>

            <div className="bg-gray-800 rounded-xl shadow border border-gray-700 overflow-x-auto p-4">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-700 text-gray-400">
                            <th className="p-3">ID / Registro</th>
                            <th className="p-3">Identificação / Título</th>
                            <th className="p-3">Detalhes Principais</th>
                            <th className="p-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeTab === 'tenants' && data.tenants.map(t => (
                            <tr key={t._id} className="border-b border-gray-700/50 hover:bg-gray-750">
                                <td className="p-3 font-mono text-xs text-gray-400">{t._id}</td>
                                <td className="p-3 font-bold">
                                    {editingId === t._id ? (
                                        <input value={editForm.tradeName || ''} onChange={e => setEditForm({ ...editForm, tradeName: e.target.value })} className="bg-gray-900 border p-1 rounded text-white" />
                                    ) : t.tradeName}
                                </td>
                                <td className="p-3 text-gray-300">CNPJ: {t.cnpj} | CRECI: {t.creci}</td>
                                <td className="p-3 text-right">
                                    {editingId === t._id ? (
                                        <button onClick={() => handleSave('tenant', t._id)} className="bg-green-600 p-2 rounded text-white"><Save size={16} /></button>
                                    ) : (
                                        <button onClick={() => handleEditClick(t)} className="bg-blue-600 p-2 rounded text-white"><Edit2 size={16} /></button>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {activeTab === 'users' && data.users.map(u => (
                            <tr key={u._id} className="border-b border-gray-700/50 hover:bg-gray-750">
                                <td className="p-3 font-mono text-xs text-gray-400">{u._id}</td>
                                <td className="p-3 font-bold">
                                    {editingId === u._id ? (
                                        <input value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="bg-gray-900 border p-1 rounded text-white" />
                                    ) : u.name}
                                </td>
                                <td className="p-3 text-gray-300">{u.email} | {u.phone} | <span className="text-yellow-400 font-semibold">{u.role}</span></td>
                                <td className="p-3 text-right">
                                    {editingId === u._id ? (
                                        <button onClick={() => handleSave('user', u._id)} className="bg-green-600 p-2 rounded text-white"><Save size={16} /></button>
                                    ) : (
                                        <button onClick={() => handleEditClick(u)} className="bg-blue-600 p-2 rounded text-white"><Edit2 size={16} /></button>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {activeTab === 'properties' && data.properties.map(p => (
                            <tr key={p._id} className="border-b border-gray-700/50 hover:bg-gray-750">
                                <td className="p-3 font-mono text-xs text-gray-400">{p._id}</td>
                                <td className="p-3 font-bold">
                                    {editingId === p._id ? (
                                        <input value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="bg-gray-900 border p-1 rounded text-white" />
                                    ) : p.title}
                                </td>
                                <td className="p-3 text-gray-300">R$ {p.price} | {p.purpose}</td>
                                <td className="p-3 text-right">
                                    {editingId === p._id ? (
                                        <button onClick={() => handleSave('property', p._id)} className="bg-green-600 p-2 rounded text-white"><Save size={16} /></button>
                                    ) : (
                                        <button onClick={() => handleEditClick(p)} className="bg-blue-600 p-2 rounded text-white"><Edit2 size={16} /></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};