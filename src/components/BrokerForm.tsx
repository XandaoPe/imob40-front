// frontend/src/components/BrokerForm.tsx
import React, { useState } from 'react';
import { api } from '../services/api';
import { UserPlus, Lock, Mail, Phone, User, Award, FileText } from 'lucide-react';

interface BrokerFormProps {
    onSuccess: (message: string) => void;
    onError: (error: string) => void;
}

export const BrokerForm: React.FC<BrokerFormProps> = ({ onSuccess, onError }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [creci, setCreci] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const savedUser = localStorage.getItem('user');
            const currentUser = savedUser ? JSON.parse(savedUser) : null;

            if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
                onError('Apenas administradores podem cadastrar corretores.');
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('tenantId', currentUser.tenantId);
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('creci', creci);
            formData.append('phone', phone);
            formData.append('bio', bio);
            formData.append('role', 'BROKER');
            formData.append('requesterRole', currentUser.role);

            if (avatar) {
                formData.append('avatar', avatar);
            }

            await api.post('/users', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            onSuccess('Corretor cadastrado com sucesso!');
            setName('');
            setEmail('');
            setPassword('');
            setCreci('');
            setPhone('');
            setBio('');
            setAvatar(null);
        } catch (err: any) {
            onError(err.response?.data?.error || 'Erro ao cadastrar corretor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-800 dark:text-gray-100">
                <UserPlus className="h-5 w-5 text-blue-600" /> Cadastrar Novo Corretor
            </h2>

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
                            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
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
                            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Senha Provisória</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="password"
                            required
                            placeholder="******"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
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
                            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
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
                            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Foto de Perfil (Avatar)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
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
                        className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 resize-none"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
                {loading ? 'Cadastrando...' : 'Cadastrar Corretor'}
            </button>
        </form>
    );
};