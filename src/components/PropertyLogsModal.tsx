import React from 'react';
import { History, X } from 'lucide-react';

interface PropertyChangeDetail {
    field: string;
    oldValue: any;
    newValue: any;
}

interface PropertyLogItem {
    propertyTitle: string;
    tenantName: string;
    userName: string;
    date: string;
    changes: (PropertyChangeDetail | string)[];
}

interface PropertyLogsModalProps {
    isOpen: boolean;
    onClose: () => void;
    changeLogsList: PropertyLogItem[];
    isSuperAdmin: boolean;
}

export const PropertyLogsModal: React.FC<PropertyLogsModalProps> = ({ isOpen, onClose, changeLogsList, isSuperAdmin }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden border dark:border-gray-700">
                <div className="bg-purple-900 text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-sm md:text-base flex items-center gap-2">
                        <History className="w-5 h-5" /> Histórico de Alterações de Imóveis {isSuperAdmin && '(Todas Imobiliárias)'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs md:text-sm">
                    {changeLogsList.length > 0 ? (
                        changeLogsList.map((log, index) => (
                            <div key={index} className="p-3 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 space-y-2">
                                <div className="flex justify-between items-start font-semibold text-gray-800 dark:text-gray-100">
                                    <span>🏠 {log.propertyTitle} <span className="text-xs text-gray-500 font-normal">({log.tenantName})</span></span>
                                    <span className="text-[11px] text-gray-500">{new Date(log.date).toLocaleString('pt-BR')}</span>
                                </div>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                    👤 Quem alterou: {log.userName || 'Usuário'}
                                </p>
                                <div className="mt-1 pt-1 border-t border-gray-200 dark:border-gray-800">
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Campos alterados:</p>
                                    <div className="space-y-1.5">
                                        {log.changes.map((change, cIdx: number) => {
                                            if (typeof change === 'string') {
                                                return (
                                                    <div key={cIdx} className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-700">
                                                        • {change}
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div key={cIdx} className="bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-700 text-xs space-y-1">
                                                    <span className="font-semibold text-purple-700 dark:text-purple-300 block">📌 Campo: {change.field}</span>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        <div className="bg-red-50 dark:bg-red-950/40 p-1.5 rounded border border-red-200 dark:border-red-900/50">
                                                            <span className="font-bold text-red-600 dark:text-red-400 text-[10px] block uppercase">Estava (Antigo):</span>
                                                            <span className="text-gray-700 dark:text-gray-300 break-all">
                                                                {typeof change.oldValue === 'object' ? JSON.stringify(change.oldValue) : (change.oldValue ?? 'Vazio')}
                                                            </span>
                                                        </div>
                                                        <div className="bg-green-50 dark:bg-green-950/40 p-1.5 rounded border border-green-200 dark:border-green-900/50">
                                                            <span className="font-bold text-green-600 dark:text-green-400 text-[10px] block uppercase">Ficou (Novo):</span>
                                                            <span className="text-gray-700 dark:text-gray-300 break-all">
                                                                {typeof change.newValue === 'object' ? JSON.stringify(change.newValue) : (change.newValue ?? 'Vazio')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-400 py-8">Nenhum log de alteração registrado.</p>
                    )}
                </div>
                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-xs font-semibold transition"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};