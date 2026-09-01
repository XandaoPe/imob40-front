import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Property, Tenant } from '../types';
import {
    Building2, Bed, Bath, Car, Maximize, MessageCircle, Search,
    X, ChevronLeft, ChevronRight, MapPin, DollarSign, Shield,
    Check, Eye, Phone, Mail, FileText, SlidersHorizontal, Trash2
} from 'lucide-react';

interface PublicCatalogProps {
    tenantId?: string;
}

export const PublicCatalog: React.FC<PublicCatalogProps> = ({ tenantId }) => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [search, setSearch] = useState('');
    const [city, setCity] = useState('');
    const [type, setType] = useState('');
    const [purpose, setPurpose] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Modal state
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
    const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `http://localhost:3000${url}`;
    };

    const fetchTenantData = async () => {
        if (!tenantId) return;
        try {
            const response = await api.get(`/tenants/${tenantId}`);
            setTenant(response.data);
        } catch (error) {
            console.error('Erro ao carregar dados da imobiliária', error);
        }
    };

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (city) params.append('city', city);
            if (type) params.append('type', type);
            if (purpose) params.append('purpose', purpose);

            const cleanMin = minPrice ? (Number(minPrice.replace(/\D/g, '')) / 100).toString() : '';
            const cleanMax = maxPrice ? (Number(maxPrice.replace(/\D/g, '')) / 100).toString() : '';
            if (cleanMin) params.append('minPrice', cleanMin);
            if (cleanMax) params.append('maxPrice', cleanMax);

            const endpoint = tenantId
                ? `/properties/public/tenant/${tenantId}?${params.toString()}`
                : `/properties/public?${params.toString()}`;

            const response = await api.get(endpoint);
            setProperties(response.data);
        } catch (error) {
            console.error('Erro ao carregar imóveis', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = () => {
        setSearch('');
        setCity('');
        setType('');
        setPurpose('');
        setMinPrice('');
        setMaxPrice('');
    };

    useEffect(() => {
        if (tenantId) {
            fetchTenantData();
        } else {
            setTenant(null);
        }
    }, [tenantId]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProperties();
        }, 300);

        return () => clearTimeout(timer);
    }, [search, city, type, purpose, minPrice, maxPrice, tenantId]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        if (!rawValue) {
            setter('');
            return;
        }
        const numericValue = Number(rawValue) / 100;
        const formatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2
        }).format(numericValue);
        setter(formatted);
    };

    const openPropertyModal = (property: Property) => {
        setSelectedProperty(property);
        setActiveImageIndex(0);
    };

    const closePropertyModal = () => {
        setSelectedProperty(null);
        setActiveImageIndex(0);
        setIsImageModalOpen(false);
    };

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!selectedProperty || !selectedProperty.images) return;
        setActiveImageIndex((prev) => (prev + 1) % selectedProperty.images.length);
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!selectedProperty || !selectedProperty.images) return;
        setActiveImageIndex((prev) => (prev - 1 + selectedProperty.images.length) % selectedProperty.images.length);
    };

    const matchesSearch = (text: string) => {
        if (!search || !text) return false;
        return text.toLowerCase().includes(search.toLowerCase());
    };

    const matchesCity = (propCity: string) => {
        if (!city || !propCity) return false;
        return propCity.toLowerCase().includes(city.toLowerCase());
    };

    const matchesPurpose = (propPurpose: string) => {
        if (!purpose) return false;
        return propPurpose === purpose;
    };

    const hasActiveFilters = Boolean(search || city || type || purpose || minPrice || maxPrice);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
            <div>
                {/* Modern Glassmorphism Header */}
                <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 transition-all">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            {tenant?.logoUrl ? (
                                <img src={getImageUrl(tenant.logoUrl)} alt={tenant.tradeName} className="h-9 object-contain" />
                            ) : (
                                <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md shadow-blue-600/20">
                                    <Building2 className="h-5 w-5" />
                                </div>
                            )}
                            <span className="text-lg font-bold tracking-tight text-slate-900">
                                {tenant?.tradeName || 'Portal Imobiliário'}
                            </span>
                        </div>
                        {tenant?.settings?.whatsappContact && (
                            <a
                                href={`https://wa.me/55${tenant.settings.whatsappContact.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-semibold text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                            >
                                <MessageCircle className="h-4 w-4" /> Fale Conosco
                            </a>
                        )}
                    </div>
                </header>

                {/* Compact Hero & Expanded Filter Bar Section */}
                <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-6 px-4 sm:px-6 overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

                    <div className="max-w-7xl mx-auto relative z-10">
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-4 text-center">
                            Encontre o imóvel ideal para você
                        </h1>

                        {/* Compact & Expanded Filter Container */}
                        <div className="bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-2xl border border-white/20 text-slate-800 max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5 items-center">
                                {/* Search input - spans 2 columns */}
                                <div className="relative lg:col-span-2">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Search className="h-4 w-4" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="O que procura, bairro ou corretor..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                                    />
                                </div>

                                {/* City */}
                                <div className="relative lg:col-span-1">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <MapPin className="h-4 w-4" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Cidade..."
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                                    />
                                </div>

                                {/* Type */}
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full lg:col-span-1 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
                                >
                                    <option value="">Tipo de Imóvel</option>
                                    <option value="HOUSE">Casa</option>
                                    <option value="APARTMENT">Apartamento</option>
                                    <option value="LAND">Terreno</option>
                                    <option value="COMMERCIAL">Comercial</option>
                                </select>

                                {/* Purpose */}
                                <select
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    className="w-full lg:col-span-1 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
                                >
                                    <option value="">Finalidade</option>
                                    <option value="SALE">Venda</option>
                                    <option value="RENT">Locação</option>
                                </select>

                                {/* Min Price */}
                                <div className="lg:col-span-1">
                                    <input
                                        type="text"
                                        placeholder="Preço Mín."
                                        value={minPrice}
                                        onChange={(e) => handleCurrencyChange(e, setMinPrice)}
                                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                                    />
                                </div>

                                {/* Max Price */}
                                <div className="lg:col-span-1">
                                    <input
                                        type="text"
                                        placeholder="Preço Máx."
                                        value={maxPrice}
                                        onChange={(e) => handleCurrencyChange(e, setMaxPrice)}
                                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            {/* Clear Filters Button Row */}
                            {hasActiveFilters && (
                                <div className="flex justify-end mt-3 pt-3 border-t border-slate-100">
                                    <button
                                        onClick={handleClearFilters}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Limpar Filtros
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Main Content Grid */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    {loading ? (
                        <div className="flex justify-center items-center py-24">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto p-8">
                            <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Nenhum imóvel encontrado</h3>
                            <p className="text-sm text-slate-500 mb-4">Tente ajustar os filtros ou termos de busca para encontrar o que procura.</p>
                            {hasActiveFilters && (
                                <button
                                    onClick={handleClearFilters}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                                >
                                    Limpar todos os filtros
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {properties.map((property) => {
                                const coverImage = property.images?.find(img => img.isCover) || property.images?.[0];
                                const broker = property.brokerId;
                                const propertyTenant = typeof property.tenantId === 'object' && property.tenantId !== null ? (property.tenantId as any) : null;

                                const isPurposeMatched = matchesPurpose(property.purpose) || matchesSearch(property.purpose === 'SALE' ? 'venda' : 'locação');
                                const isCityMatched = matchesCity(property.location.city) || matchesSearch(property.location.city);
                                const isTitleMatched = matchesSearch(property.title);
                                const isNeighborhoodMatched = matchesSearch(property.location.neighborhood);

                                return (
                                    <div
                                        key={property._id}
                                        onClick={() => openPropertyModal(property)}
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

                                                <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
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
                            })}
                        </div>
                    )}
                </main>
            </div>

            {/* Property Detail Modal */}
            {selectedProperty && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-auto relative animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center z-20">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold uppercase bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full">
                                        {selectedProperty.purpose === 'SALE' ? 'Venda' : 'Locação'}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-500 uppercase">{selectedProperty.type}</span>
                                </div>
                                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{selectedProperty.title}</h2>
                            </div>
                            <button
                                onClick={closePropertyModal}
                                className="p-2.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 sm:p-8 space-y-8">
                            {/* Carousel / Image Viewer */}
                            {selectedProperty.images && selectedProperty.images.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="relative h-80 sm:h-96 bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center group">
                                        <img
                                            src={getImageUrl(selectedProperty.images[activeImageIndex]?.url)}
                                            alt={selectedProperty.title}
                                            className="max-h-full max-w-full object-contain cursor-pointer"
                                            onClick={() => setIsImageModalOpen(true)}
                                            title="Clique para ver imagem inteira"
                                        />

                                        {selectedProperty.images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full transition backdrop-blur-md"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full transition backdrop-blur-md"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}

                                        <button
                                            onClick={() => setIsImageModalOpen(true)}
                                            className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition backdrop-blur-md shadow-lg"
                                        >
                                            <Eye className="w-4 h-4" /> Ver tela cheia
                                        </button>

                                        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-md">
                                            {activeImageIndex + 1} / {selectedProperty.images.length}
                                        </div>
                                    </div>

                                    {/* Thumbnails */}
                                    {selectedProperty.images.length > 1 && (
                                        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                                            {selectedProperty.images.map((img, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setActiveImageIndex(idx)}
                                                    className={`relative flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${idx === activeImageIndex ? 'border-blue-600 ring-2 ring-blue-300 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                                                        }`}
                                                >
                                                    <img src={getImageUrl(img.url)} alt="" className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-48 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-sm">
                                    Nenhuma imagem cadastrada para este imóvel.
                                </div>
                            )}

                            {/* Price & Features */}
                            <div className="flex flex-wrap justify-between items-center bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                                <div>
                                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Valor do Imóvel</span>
                                    <p className="text-3xl font-black text-blue-600 tracking-tight">{formatCurrency(selectedProperty.price)}</p>
                                </div>
                                <div className="flex gap-6 text-sm text-slate-600 mt-3 sm:mt-0">
                                    {selectedProperty.condoFee ? (
                                        <div>
                                            <span className="text-xs text-slate-400 block font-medium">Condomínio</span>
                                            <span className="font-bold text-slate-800">{formatCurrency(selectedProperty.condoFee)}</span>
                                        </div>
                                    ) : null}
                                    {selectedProperty.taxFee ? (
                                        <div>
                                            <span className="text-xs text-slate-400 block font-medium">IPTU</span>
                                            <span className="font-bold text-slate-800">{formatCurrency(selectedProperty.taxFee)}</span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            {/* Key specs grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                                    <Bed className="w-5 h-5 mx-auto text-blue-600 mb-1.5" />
                                    <span className="text-xs text-slate-400 block font-medium">Quartos</span>
                                    <span className="font-bold text-slate-800">{selectedProperty.features.bedrooms}</span>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                                    <Bath className="w-5 h-5 mx-auto text-blue-600 mb-1.5" />
                                    <span className="text-xs text-slate-400 block font-medium">Banheiros</span>
                                    <span className="font-bold text-slate-800">{selectedProperty.features.bathrooms}</span>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                                    <Car className="w-5 h-5 mx-auto text-blue-600 mb-1.5" />
                                    <span className="text-xs text-slate-400 block font-medium">Vagas</span>
                                    <span className="font-bold text-slate-800">{selectedProperty.features.parkingSpaces}</span>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                                    <Maximize className="w-5 h-5 mx-auto text-blue-600 mb-1.5" />
                                    <span className="text-xs text-slate-400 block font-medium">Área Útil</span>
                                    <span className="font-bold text-slate-800">{selectedProperty.features.usableArea} m²</span>
                                </div>
                            </div>

                            {/* Location & Dimensions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-blue-600" /> Endereço
                                    </h3>
                                    <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
                                        {selectedProperty.location.street}, {selectedProperty.location.number} - {selectedProperty.location.neighborhood}<br />
                                        {selectedProperty.location.city} / {selectedProperty.location.state} — CEP: {selectedProperty.location.cep}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-600" /> Dimensões
                                    </h3>
                                    <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
                                        Área Útil: {selectedProperty.features.usableArea} m²<br />
                                        Área Total: {selectedProperty.features.totalArea} m²<br />
                                        Suítes: {selectedProperty.features.suites || 0}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-bold text-slate-900">Descrição Completa</h3>
                                <p className="text-sm text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-100 whitespace-pre-line leading-relaxed">
                                    {selectedProperty.description}
                                </p>
                            </div>

                            {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="font-bold text-slate-900">Comodidades & Diferenciais</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProperty.amenities.map((amenity, idx) => (
                                            <span key={idx} className="bg-blue-50/80 text-blue-700 border border-blue-200/60 text-xs px-3.5 py-1.5 rounded-xl font-medium">
                                                ✓ {amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Broker Contact Card */}
                            {selectedProperty.brokerId && (
                                <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                                    <div className="flex items-center gap-4 text-center sm:text-left">
                                        {selectedProperty.brokerId.avatarUrl ? (
                                            <img src={getImageUrl(selectedProperty.brokerId.avatarUrl)} alt={selectedProperty.brokerId.name} className="w-16 h-16 rounded-full object-cover border-2 border-white/20 shadow-md" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl border-2 border-white/20 shadow-md">
                                                {selectedProperty.brokerId.name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-xs uppercase tracking-wider text-blue-300 font-semibold">Corretor Responsável</span>
                                            <h4 className="text-lg font-bold">{selectedProperty.brokerId.name}</h4>
                                            <p className="text-xs text-slate-300">CRECI: {selectedProperty.brokerId.creci}</p>
                                        </div>
                                    </div>
                                    <a
                                        href={`https://wa.me/55${selectedProperty.brokerId.phone?.replace(/\D/g, '') || ''}?text=Olá%20${encodeURIComponent(selectedProperty.brokerId.name)},%20gostaria%20de%20saber%20mais%20sobre%20o%20imóvel:%20${encodeURIComponent(selectedProperty.title)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2.5 transition shadow-lg shadow-emerald-600/20 w-full sm:w-auto justify-center active:scale-95"
                                    >
                                        <MessageCircle className="h-5 w-5" /> Falar no WhatsApp
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Full Image Lightbox Modal */}
            {isImageModalOpen && selectedProperty && selectedProperty.images && selectedProperty.images.length > 0 && (
                <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
                    <button
                        onClick={() => setIsImageModalOpen(false)}
                        className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition z-70"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        <img
                            src={getImageUrl(selectedProperty.images[activeImageIndex]?.url)}
                            alt="Imagem Inteira"
                            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
                        />

                        {selectedProperty.images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/15 text-white p-4 rounded-full hover:bg-white/25 transition backdrop-blur-md"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/15 text-white p-4 rounded-full hover:bg-white/25 transition backdrop-blur-md"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}

                        <div className="absolute bottom-6 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md">
                            {activeImageIndex + 1} de {selectedProperty.images.length}
                        </div>
                    </div>
                </div>
            )}

            <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-16">
                <p>{tenant?.tradeName || 'Sistema Imobiliário'} — Todos os direitos reservados.</p>
            </footer>
        </div>
    );
};