import React, { useState } from 'react';
import { api } from '../services/api';
import { Building2, Lock, Mail, Fingerprint } from 'lucide-react';

interface AuthScreenProps {
    onLoginSuccess: (userData: any) => void;
}

// Função auxiliar para converter Base64Url para Uint8Array para o WebAuthn
const base64UrlToUint8Array = (base64Url: string) => {
    const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
    const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        tenantName: '',
        tradeName: '',
        cnpj: '',
        creciTenant: '',
        adminName: '',
        adminEmail: '',
        adminPhone: '',
        adminPassword: ''
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError('');
            const response = await api.post('/auth/login', { identifier, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            onLoginSuccess(response.data.user);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao realizar login.');
        }
    };

    // Função para cadastrar biometria configurada com Chave Residente (Resident Key)
    const handleRegisterBiometric = async () => {
        try {
            setError('');
            if (!identifier) {
                setError('Digite seu e-mail acima para vincular a biometria.');
                return;
            }

            if (!window.PublicKeyCredential) {
                setError('Este navegador não suporta autenticação por biometria.');
                return;
            }

            const chalRes = await api.get(`/auth/biometric/challenge?email=${identifier}`);
            const { userId, email, name } = chalRes.data;

            const publicKey: PublicKeyCredentialCreationOptions = {
                challenge: new TextEncoder().encode(chalRes.data.challenge),
                rp: { name: 'Sistema Imobiliario' },
                user: {
                    id: new TextEncoder().encode(userId),
                    name: email,
                    displayName: name || email
                },
                pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
                timeout: 60000,
                attestation: 'none',
                authenticatorSelection: {
                    authenticatorAttachment: 'platform',
                    residentKey: 'required',
                    userVerification: 'required'
                }
            };

            const cred = await navigator.credentials.create({ publicKey }) as PublicKeyCredential;
            if (cred) {
                await api.post('/auth/biometric/register', {
                    userId: userId,
                    credentialId: cred.id,
                    publicKey: 'active'
                });
                setSuccess('Biometria cadastrada com sucesso! Agora você pode usá-la para entrar.');
            }
        } catch (err: any) {
            setError('Não foi possível cadastrar a biometria. Verifique se cancelou a operação ou se o dispositivo suporta.');
        }
    };

    // Função de Login por Biometria Blindada contra chaves antigas
    const handleBiometricLogin = async () => {
        try {
            setError('');

            if (!window.PublicKeyCredential) {
                setError('Este navegador não suporta autenticação por biometria.');
                return;
            }

            const chalRes = await api.get('/auth/biometric/challenge');
            const { challenge, allowedCredentialIds } = chalRes.data;

            if (!allowedCredentialIds || allowedCredentialIds.length === 0) {
                setError('Nenhuma biometria cadastrada no sistema. Faça login com senha e cadastre a biometria.');
                return;
            }

            const publicKey: PublicKeyCredentialRequestOptions = {
                challenge: new TextEncoder().encode(challenge),
                allowCredentials: allowedCredentialIds.map((id: string) => ({
                    id: base64UrlToUint8Array(id),
                    type: 'public-key',
                    transports: ['internal']
                })),
                timeout: 60000,
                userVerification: 'required'
            };

            const assertion = await navigator.credentials.get({ publicKey }) as PublicKeyCredential;
            if (assertion) {
                const response = await api.post('/auth/biometric/login', {
                    credentialId: assertion.id
                });
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                onLoginSuccess(response.data.user);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Falha na autenticação biométrica. Tente novamente ou use a senha.');
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError('');
            const response = await api.post('/auth/register-tenant', form);
            setSuccess(response.data.message);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setTimeout(() => onLoginSuccess(response.data.user), 1500);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao registrar imobiliária.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 text-gray-100">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700">
                <div className="text-center mb-6">
                    <Building2 className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                    <h1 className="text-2xl font-bold">Sistema Imobiliário Multi-Tenant</h1>
                    <p className="text-sm text-gray-400">{isRegistering ? 'Cadastre sua Imobiliária e seu acesso Admin (Biometria opcional posterior)' : 'Faça login com e-mail/telefone ou Biometria'}</p>
                </div>

                {error && <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded text-sm">{error}</div>}
                {success && <div className="mb-4 p-3 bg-green-900/50 border border-green-700 text-green-200 rounded text-sm">{success}</div>}

                {!isRegistering ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">E-mail ou Telefone</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="ex: seu@email.com ou 11999999999"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="password"
                                    placeholder="******"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-lg transition">
                            Entrar com Senha
                        </button>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleBiometricLogin}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold p-3 rounded-lg transition flex items-center justify-center gap-2 text-sm"
                            >
                                <Fingerprint className="h-5 w-5" /> Entrar por Biometria
                            </button>
                            <button
                                type="button"
                                onClick={handleRegisterBiometric}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold p-3 rounded-lg transition flex items-center justify-center gap-2 text-sm border border-gray-600"
                            >
                                Cadastrar Biometria
                            </button>
                        </div>

                        <p className="text-center text-sm text-gray-400 mt-4">
                            Não tem uma imobiliária cadastrada?{' '}
                            <button type="button" onClick={() => setIsRegistering(true)} className="text-blue-400 hover:underline font-medium">
                                Cadastre-se aqui
                            </button>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider border-b border-gray-700 pb-1">Dados da Imobiliária</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <input type="text" placeholder="Razão Social" required value={form.tenantName} onChange={e => setForm({ ...form, tenantName: e.target.value })} className="bg-gray-900 border border-gray-700 p-2.5 rounded text-sm text-white" />
                            <input type="text" placeholder="Nome Fantasia" required value={form.tradeName} onChange={e => setForm({ ...form, tradeName: e.target.value })} className="bg-gray-900 border border-gray-700 p-2.5 rounded text-sm text-white" />
                            <input type="text" placeholder="CNPJ" required value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} className="bg-gray-900 border border-gray-700 p-2.5 rounded text-sm text-white" />
                            <input type="text" placeholder="CRECI Imobiliária" required value={form.creciTenant} onChange={e => setForm({ ...form, creciTenant: e.target.value })} className="bg-gray-900 border border-gray-700 p-2.5 rounded text-sm text-white" />
                        </div>

                        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider border-b border-gray-700 pb-1 pt-2">Administrador Inicial</h3>
                        <input type="text" placeholder="Nome do Admin" required value={form.adminName} onChange={e => setForm({ ...form, adminName: e.target.value })} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded text-sm text-white" />
                        <div className="grid grid-cols-2 gap-2">
                            <input type="email" placeholder="E-mail Admin" required value={form.adminEmail} onChange={e => setForm({ ...form, adminEmail: e.target.value })} className="bg-gray-900 border border-gray-700 p-2.5 rounded text-sm text-white" />
                            <input type="text" placeholder="Telefone (WhatsApp)" required value={form.adminPhone} onChange={e => setForm({ ...form, adminPhone: e.target.value })} className="bg-gray-900 border border-gray-700 p-2.5 rounded text-sm text-white" />
                        </div>
                        <input type="password" placeholder="Senha de Acesso" required value={form.adminPassword} onChange={e => setForm({ ...form, adminPassword: e.target.value })} className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded text-sm text-white" />

                        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold p-3 rounded-lg transition mt-2">
                            Registrar Imobiliária & Admin
                        </button>
                        <p className="text-center text-sm text-gray-200 mt-2">
                            Já tem conta?{' '}
                            <button type="button" onClick={() => setIsRegistering(false)} className="text-blue-400 hover:underline font-medium">
                                Faça login
                            </button>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};