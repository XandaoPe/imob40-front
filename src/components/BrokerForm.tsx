import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { UserPlus, Lock, Mail, Phone, User, Award, FileText, CheckCircle2, X } from 'lucide-react';
import { Broker } from '../types';

interface BrokerFormProps {
    onSuccess: (message: string) => void;
    onError: (error: string) => void;
    editingBroker?: Broker | null;
    onCancelEdit?: () => void;
    onClearMessages?: () => void;
}

export const BrokerForm: React.FC<BrokerFormProps> = ({
    onSuccess,
    onError,
    editingBroker,
    onCancelEdit,
    onClearMessages
}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [creci, setCreci] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [isActive, setIsActive] = useState<boolean>(true);
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingBroker) {
            setName(editingBroker.name || '');
            setEmail(editingBroker.email || '');
            setPassword('');
            setCreci(editingBroker.creci || '');
            setPhone(editingBroker.phone || '');
            setBio(editingBroker.bio || '');
            setIsActive(editingBroker.isActive !== false);
            setAvatar(null);
            setAvatarPreview(editingBroker.avatarUrl ? getImageUrl(editingBroker.avatarUrl) : null);
        } else {
            resetForm();
        }
    }, [editingBroker]);

    const resetForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setCreci('');
        setPhone('');
        setBio('');
        setIsActive(true);
        setAvatar(null);
        setAvatarPreview(null);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onClearMessages) onClearMessages();
        const file = e.target.files?.[0] || null;
        setAvatar(file);
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const baseUrl = api.defaults.baseURL?.replace('/api/v1', '') || 'http://localhost:3000';
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (onClearMessages) onClearMessages();
        setLoading(true);

        try {
            const savedUser = localStorage.getItem('user');
            const currentUser = savedUser ? JSON.parse(savedUser) : null;

            if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
                onError('Apenas administradores podem gerenciar corretores.');
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('tenantId', currentUser.tenantId);
            formData.append('name', name);
            formData.append('email', email);
            if (password) {
                formData.append('password', password);
            }
            formData.append('creci', creci);
            formData.append('phone', phone);
            formData.append('bio', bio);
            formData.append('role', 'BROKER');
            formData.append('isActive', String(isActive));
            formData.append('requesterRole', currentUser.role);

            if (avatar) {
                formData.append('avatar', avatar);
            }

            if (editingBroker) {
                await api.put(`/users/${editingBroker._id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                onSuccess('Corretor atualizado com sucesso!');
                if (onCancelEdit) onCancelEdit();
            } else {
                await api.post('/users', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                onSuccess('Corretor cadastrado com sucesso!');
                resetForm();
            }
        } catch (err: any) {
            onError(err.response?.data?.error || 'Erro ao salvar corretor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4" onChange={() => { if (onClearMessages) onClearMessages(); }}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100">
                    <UserPlus className="h-5 w-5 text-blue-600" /> {editingBroker ? 'Editar Corretor' : 'Cadastrar Novo Corretor / Usuário'}
                </h2>
                {editingBroker && onCancelEdit && (
                    <button type="button" onClick={onCancelEdit} className="text-red-500 hover:underline flex items-center gap-1 text-xs">
                        <X className="w-4 h-4" /> Cancelar Edição
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Nome Completo</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            required
                            placeholder="Ex: João da Silva"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">E-mail de Acesso</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="email"
                            required
                            placeholder="joao@imobiliaria.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        {editingBroker ? 'Nova Senha (deixe em branco para manter)' : 'Senha Provisória'}
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="password"
                            required={!editingBroker}
                            placeholder="******"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">CRECI</label>
                    <div className="relative">
                        <Award className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            required
                            placeholder="123456-F"
                            value={creci}
                            onChange={(e) => setCreci(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">WhatsApp / Telefone</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            required
                            placeholder="(11) 99999-9999"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Status do Usuário</label>
                    <select
                        value={String(isActive)}
                        onChange={(e) => setIsActive(e.target.value === 'true')}
                        className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    >
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                    </select>
                </div>

                <div className="md:col-span-2 flex items-center gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Foto de Perfil (Avatar)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                    {avatarPreview && (
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500 flex-shrink-0 shadow">
                            <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Biografia / Apresentação</label>
                <div className="relative">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                        rows={3}
                        placeholder="Breve descrição sobre a experiência do corretor..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 resize-none text-gray-900 dark:text-gray-100"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
                <CheckCircle2 className="w-5 h-5" />
                {loading ? 'Salvando...' : (editingBroker ? 'Salvar Alterações' : 'Cadastrar Corretor')}
            </button>
        </form>
    );
};