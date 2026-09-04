import React from 'react';
import { Broker } from '../types';
import { Users, Edit, Trash2, User as UserIcon } from 'lucide-react';
import { api } from '../services/api';

interface BrokerListProps {
    brokersList: Broker[];
    isSuperAdmin: boolean;
    isAdmin: boolean;
    onEdit: (broker: Broker) => void;
    onDelete: (id: string) => void;
}

export const BrokerList: React.FC<BrokerListProps> = ({
    brokersList,
    isSuperAdmin,
    isAdmin,
    onEdit,
    onDelete
}) => {
    const getImageUrl = (url?: string) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        const baseUrl = api.defaults.baseURL?.replace('/api/v1', '') || 'http://localhost:3000';
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1">
                    <Users className="w-4 h-4 text-blue-500" /> Corretores Cadastrados ({brokersList.length}) {isSuperAdmin && <span className="text-purple-500 text-xs">(Modo Super Admin - Todos)</span>}
                </h3>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 text-xs">
                {brokersList.map(broker => {
                    const avatarSrc = getImageUrl(broker.avatarUrl);
                    return (
                        <div key={broker._id} className="p-2 border dark:border-gray-700 rounded flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                                {avatarSrc ? (
                                    <img src={avatarSrc} alt={broker.name} className="w-10 h-10 object-cover rounded-full border dark:border-gray-700 flex-shrink-0" />
                                ) : (
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 flex-shrink-0">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-gray-100">{broker.name} - <span className="text-blue-600 font-mono">CRECI: {broker.creci || 'N/D'}</span></p>
                                    <p className="text-gray-500 dark:text-gray-400">{broker.email} | Tel: {broker.phone || 'N/D'} | Função: {broker.role}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] ${broker.isActive !== false ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                    {broker.isActive !== false ? 'Ativo' : 'Inativo'}
                                </span>
                                {isAdmin && (
                                    <>
                                        <button
                                            onClick={() => onEdit(broker)}
                                            className="p-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 rounded hover:bg-blue-200 transition"
                                            title="Editar Corretor"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(broker._id)}
                                            className="p-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 rounded hover:bg-red-200 transition"
                                            title="Excluir Corretor"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
                {brokersList.length === 0 && (
                    <p className="text-gray-400 text-center py-2">Nenhum corretor cadastrado.</p>
                )}
            </div>
        </div>
    );
};