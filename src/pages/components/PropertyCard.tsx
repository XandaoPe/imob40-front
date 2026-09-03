import React from 'react';
import { Building2, Bed, Bath, Car, Maximize, MessageCircle, MapPin } from 'lucide-react';
import { Property } from '../../types';

interface PropertyCardProps {
    property: Property;
    onSelect: (property: Property) => void;
    formatCurrency: (val: number) => string;
    getImageUrl: (url: string) => string;
    matchesSearch: (text: string) => boolean;
    matchesCity: (city: string) => boolean;
    matchesPurpose: (purpose: string) => boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
    property,
    onSelect,
    formatCurrency,
    getImageUrl,
    matchesSearch,
    matchesCity,
    matchesPurpose
}) => {
    const coverImage = property.images?.find(img => img.isCover) || property.images?.[0];
    const broker = property.brokerId;
    const propertyTenant = typeof property.tenantId === 'object' && property.tenantId !== null ? (property.tenantId as any) : null;

    const isPurposeMatched = matchesPurpose(property.purpose) || matchesSearch(property.purpose === 'SALE' ? 'venda' : 'locação');
    const isCityMatched = matchesCity(property.location.city) || matchesSearch(property.location.city);
    const isTitleMatched = matchesSearch(property.title);
    const isNeighborhoodMatched = matchesSearch(property.location.neighborhood);

    return (
        <div
            onClick={() => onSelect(property)}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200/80 overflow-hidden flex flex-col transition-all duration-300 cursor-pointer group hover:-translate-y-1"
        >
            <div className="relative h-64 bg-slate-100 overflow-hidden">
                {coverImage ? (
                    <img
                        src={getImageUrl(coverImage.url)}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sem imagem</div>
                )}
                <span className={`absolute top-3 left-3 text-xs font-bold uppercase px-3 py-1.5 rounded-xl shadow-md transition-all ${isPurposeMatched
                        ? 'bg-amber-400 text-slate-900 ring-2 ring-amber-300'
                        : 'bg-blue-600 text-white'
                    }`}>
                    {property.purpose === 'SALE' ? 'Venda' : 'Locação'}
                </span>
                <span className="absolute top-3 right-3 bg-slate-900/70 text-white text-xs font-medium px-2.5 py-1.5 rounded-xl backdrop-blur-md">
                    {property.images?.length || 0} fotos
                </span>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    {propertyTenant && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50/80 px-2.5 py-1 rounded-lg mb-3 w-fit border border-blue-100">
                            <Building2 className="w-3.5 h-3.5" />
                            {propertyTenant.tradeName || propertyTenant.name}
                        </div>
                    )}

                    <h3 className={`text-lg font-bold mb-1.5 line-clamp-1 transition rounded px-1 -mx-1 ${isTitleMatched ? 'bg-amber-100 text-amber-900 font-extrabold' : 'text-slate-900 group-hover:text-blue-600'
                        }`}>
                        {property.title}
                    </h3>

                    <p className="text-sm text-slate-500 mb-4 flex items-center gap-1 flex-wrap">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className={`rounded px-1 ${isNeighborhoodMatched ? 'bg-amber-100 text-amber-900 font-semibold' : ''}`}>
                            {property.location.neighborhood}
                        </span>
                        <span>,</span>
                        <span className={`rounded px-1 ${isCityMatched ? 'bg-amber-100 text-amber-900 font-semibold' : ''}`}>
                            {property.location.city}
                        </span>
                        <span>- {property.location.state}</span>
                    </p>

                    <p className="text-2xl font-black text-blue-600 mb-5 tracking-tight">{formatCurrency(property.price)}</p>

                    <div className="grid grid-cols-4 gap-2 text-slate-600 text-xs font-medium border-t border-b border-slate-100 py-3.5 mb-5 text-center">
                        <div className="flex flex-col items-center gap-1">
                            <Bed className="h-4 w-4 text-slate-400" />
                            <span>{property.features.bedrooms} qtos</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 border-x border-slate-100">
                            <Bath className="h-4 w-4 text-slate-400" />
                            <span>{property.features.bathrooms} banh</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <Car className="h-4 w-4 text-slate-400" />
                            <span>{property.features.parkingSpaces} vgs</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 border-l border-slate-100">
                            <Maximize className="h-4 w-4 text-slate-400" />
                            <span>{property.features.usableArea}m²</span>
                        </div>
                    </div>
                </div>

                {broker && (
                    <div className="bg-slate-50/80 p-3 rounded-xl flex items-center justify-between border border-slate-100">
                        <div className="flex items-center gap-3">
                            {broker.avatarUrl ? (
                                <img src={getImageUrl(broker.avatarUrl)} alt={broker.name} className="w-10 h-10 rounded-full object-cover border border-white shadow-sm" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                    {broker.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-bold text-slate-800">{broker.name}</p>
                                <p className="text-[11px] text-slate-500">CRECI: {broker.creci}</p>
                            </div>
                        </div>
                        <a
                            href={`https://wa.me/55${broker.phone?.replace(/\D/g, '') || ''}?text=Olá%20${encodeURIComponent(broker.name)},%20gostaria%20de%20saber%20mais%20sobre%20o%20imóvel:%20${encodeURIComponent(property.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition shadow-sm"
                            title="Falar com corretor no WhatsApp"
                        >
                            <MessageCircle className="h-5 w-5" />
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};