import React from 'react';
import { Property } from '../types';
import { Building, History, Edit, Trash2, Image as ImageIcon } from 'lucide-react';

interface PropertyListProps {
    propertiesList: Property[];
    isSuperAdmin: boolean;
    isAdmin: boolean;
    loadingLogs: boolean;
    onEdit: (prop: Property) => void;
    onDelete: (id: string) => void;
    onFetchLogs: () => void;
}

export const PropertyList: React.FC<PropertyListProps> = ({
    propertiesList,
    isSuperAdmin,
    isAdmin,
    loadingLogs,
    onEdit,
    onDelete,
    onFetchLogs
}) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1">
                    <Building className="w-4 h-4 text-blue-500" /> Imóveis Cadastrados ({propertiesList.length}) {isSuperAdmin && <span className="text-purple-500 text-xs">(Modo Super Admin - Todos)</span>}
                </h3>
                {isAdmin && (
                    <button
                        type="button"
                        onClick={onFetchLogs}
                        disabled={loadingLogs}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition shadow"
                    >
                        <History className="w-4 h-4" /> {loadingLogs ? 'Carregando...' : 'Ver Log de Alterações'}
                    </button>
                )}
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 text-xs">
                {propertiesList.map(prop => {
                    const coverImg = prop.images?.find(img => img.isCover) || prop.images?.[0];
                    return (
                        <div key={prop._id} className="p-2 border dark:border-gray-700 rounded flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                                {coverImg?.url ? (
                                    <img src={coverImg.url} alt={prop.title} className="w-10 h-10 object-cover rounded border dark:border-gray-700 flex-shrink-0" />
                                ) : (
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400 flex-shrink-0">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-gray-100">{prop.title} - <span className="text-blue-600 font-mono">R$ {prop.price?.toLocaleString('pt-BR')}</span></p>
                                    <p className="text-gray-500 dark:text-gray-400">{prop.location?.city} / {prop.location?.neighborhood} | Tipo: {prop.type}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-[10px]">
                                    {prop.status}
                                </span>
                                <button
                                    onClick={() => onEdit(prop)}
                                    className="p-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 rounded hover:bg-blue-200 transition"
                                    title="Editar Imóvel"
                                >
                                    <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => onDelete(prop._id)}
                                    className="p-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 rounded hover:bg-red-200 transition"
                                    title="Excluir Imóvel"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
                {propertiesList.length === 0 && (
                    <p className="text-gray-400 text-center py-2">Nenhum imóvel cadastrado.</p>
                )}
            </div>
        </div>
    );
};