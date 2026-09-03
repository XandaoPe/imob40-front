import React from 'react';
import { Building2, MessageCircle } from 'lucide-react';
import { Tenant } from '../../types';

interface HeaderProps {
    tenant: Tenant | null;
    getImageUrl: (url: string) => string;
}

export const Header: React.FC<HeaderProps> = ({ tenant, getImageUrl }) => {
    return (
        <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                    {tenant?.logoUrl ? (
                        <img src={getImageUrl(tenant.logoUrl)} alt={tenant.tradeName} className="h-8 sm:h-9 object-contain flex-shrink-0" />
                    ) : (
                        <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md shadow-blue-600/25 flex-shrink-0">
                            <Building2 className="h-5 w-5" />
                        </div>
                    )}
                    <span className="text-sm sm:text-lg font-bold tracking-tight text-slate-900 truncate">
                        {tenant?.tradeName || 'Portal Imobiliário'}
                    </span>
                </div>
                {tenant?.settings?.whatsappContact && (
                    <a
                        href={`https://wa.me/55${tenant.settings.whatsappContact.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 sm:gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 sm:px-3.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-95 flex-shrink-0"
                    >
                        <MessageCircle className="h-4 w-4" />
                        <span className="hidden xs:inline">Fale Conosco</span>
                        <span className="xs:hidden">Contato</span>
                    </a>
                )}
            </div>
        </header>
    );
};