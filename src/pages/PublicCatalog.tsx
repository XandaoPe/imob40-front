import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Property, Tenant } from '../types';
import {
    Building2, Bed, Bath, Car, Maximize, MessageCircle, Search,
    X, ChevronLeft, ChevronRight, MapPin, DollarSign, Shield,
    Check, Eye, Phone, Mail, FileText
} from 'lucide-react';

interface PublicCatalogProps {
    tenantId?: string;
}

export const PublicCatalog: React.FC<PublicCatalogProps> = ({ tenantId }) => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [city, setCity] = useState('');
    const [type, setType] = useState('');
    const [purpose, setPurpose] = useState('');

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
            if (city) params.append('city', city);
            if (type) params.append('type', type);
            if (purpose) params.append('purpose', purpose);

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

    useEffect(() => {
        if (tenantId) {
            fetchTenantData();
        } else {
            setTenant(null);
        }
        fetchProperties();
    }, [tenantId]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProperties();
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
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

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col justify-between">
            <div>
                <header className="bg-white shadow-sm border-b sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            {tenant?.logoUrl ? (
                                <img src={getImageUrl(tenant.logoUrl)} alt={tenant.tradeName} className="h-10 object-contain" />
                            ) : (
                                <Building2 className="h-8 w-8 text-blue-600" />
                            )}
                            <span className="text-xl font-bold tracking-tight text-gray-900">
                                {tenant?.tradeName || 'Portal Imobiliário'}
                            </span>
                        </div>
                        {tenant?.settings?.whatsappContact && (
                            <a
                                href={`https://wa.me/55${tenant.settings.whatsappContact.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition shadow-sm"
                            >
                                <MessageCircle className="h-5 w-5" /> Fale Conosco
                            </a>
                        )}
                    </div>
                </header>

                <section className="bg-blue-900 text-white py-12 px-4 shadow-inner">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-3xl font-extrabold mb-6">Encontre o imóvel ideal para você</h1>
                        <form onSubmit={handleSearch} className="bg-white p-4 rounded-xl shadow-lg flex flex-wrap gap-4 justify-center text-gray-800 max-w-4xl mx-auto">
                            <input
                                type="text"
                                placeholder="Digite a cidade..."
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="border border-gray-300 p-3 rounded-lg flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="border border-gray-300 p-3 rounded-lg min-w-[160px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Tipo de Imóvel</option>
                                <option value="HOUSE">Casa</option>
                                <option value="APARTMENT">Apartamento</option>
                                <option value="LAND">Terreno</option>
                                <option value="COMMERCIAL">Comercial</option>
                            </select>
                            <select
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                className="border border-gray-300 p-3 rounded-lg min-w-[160px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Finalidade</option>
                                <option value="SALE">Venda</option>
                                <option value="RENT">Locação</option>
                            </select>
                            <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow">
                                <Search className="h-5 w-5" /> Buscar
                            </button>
                        </form>
                    </div>
                </section>

                <main className="max-w-7xl mx-auto px-4 py-12">
                    {loading ? (
                        <p className="text-center py-10 text-gray-500">Carregando imóveis...</p>
                    ) : properties.length === 0 ? (
                        <p className="text-center py-10 text-gray-500">Nenhum imóvel encontrado com os filtros selecionados.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {properties.map((property) => {
                                const coverImage = property.images?.find(img => img.isCover) || property.images?.[0];
                                const broker = property.brokerId;
                                const propertyTenant = typeof property.tenantId === 'object' && property.tenantId !== null ? (property.tenantId as any) : null;

                                return (
                                    <div
                                        key={property._id}
                                        onClick={() => openPropertyModal(property)}
                                        className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col border border-gray-200 hover:shadow-xl transition cursor-pointer group"
                                    >
                                        <div className="relative h-56 bg-gray-200 overflow-hidden">
                                            {coverImage ? (
                                                <img
                                                    src={getImageUrl(coverImage.url)}
                                                    alt={property.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400">Sem imagem</div>
                                            )}
                                            <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-full shadow">
                                                {property.purpose === 'SALE' ? 'Venda' : 'Locação'}
                                            </span>
                                            <span className="absolute top-3 right-3 bg-gray-900/70 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
                                                {property.images?.length || 0} fotos
                                            </span>
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col justify-between">
                                            <div>
                                                {propertyTenant && (
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md mb-2 w-fit">
                                                        <Building2 className="w-3.5 h-3.5" />
                                                        {propertyTenant.tradeName || propertyTenant.name}
                                                    </div>
                                                )}

                                                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition">
                                                    {property.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                    {property.location.neighborhood}, {property.location.city} - {property.location.state}
                                                </p>
                                                <p className="text-2xl font-black text-blue-600 mb-4">{formatCurrency(property.price)}</p>

                                                <div className="flex justify-between text-gray-600 text-sm border-t border-b border-gray-100 py-3 mb-4">
                                                    <span className="flex items-center gap-1"><Bed className="h-4 w-4 text-gray-400" /> {property.features.bedrooms} qtos</span>
                                                    <span className="flex items-center gap-1"><Bath className="h-4 w-4 text-gray-400" /> {property.features.bathrooms} banh</span>
                                                    <span className="flex items-center gap-1"><Car className="h-4 w-4 text-gray-400" /> {property.features.parkingSpaces} vgs</span>
                                                    <span className="flex items-center gap-1"><Maximize className="h-4 w-4 text-gray-400" /> {property.features.usableArea}m²</span>
                                                </div>
                                            </div>

                                            {broker && (
                                                <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between border border-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        {broker.avatarUrl ? (
                                                            <img src={getImageUrl(broker.avatarUrl)} alt={broker.name} className="w-10 h-10 rounded-full object-cover border" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                                {broker.name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-800">{broker.name}</p>
                                                            <p className="text-[11px] text-gray-500">CRECI: {broker.creci}</p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={`https://wa.me/55${broker.phone?.replace(/\D/g, '') || ''}?text=Olá%20${encodeURIComponent(broker.name)},%20gostaria%20de%20saber%20mais%20sobre%20o%20imóvel:%20${encodeURIComponent(property.title)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition shadow-sm"
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
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-auto relative animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-20">
                            <div>
                                <span className="text-xs font-bold uppercase bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full mr-2">
                                    {selectedProperty.purpose === 'SALE' ? 'Venda' : 'Locação'}
                                </span>
                                <span className="text-xs font-semibold text-gray-500 uppercase">{selectedProperty.type}</span>
                                <h2 className="text-xl font-extrabold text-gray-900 mt-1">{selectedProperty.title}</h2>
                            </div>
                            <button
                                onClick={closePropertyModal}
                                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Carousel / Image Viewer */}
                            {selectedProperty.images && selectedProperty.images.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="relative h-80 sm:h-96 bg-black rounded-xl overflow-hidden shadow-inner flex items-center justify-center group">
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
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2.5 rounded-full hover:bg-black/80 transition backdrop-blur-sm"
                                                >
                                                    <ChevronLeft className="w-6 h-6" />
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2.5 rounded-full hover:bg-black/80 transition backdrop-blur-sm"
                                                >
                                                    <ChevronRight className="w-6 h-6" />
                                                </button>
                                            </>
                                        )}

                                        <button
                                            onClick={() => setIsImageModalOpen(true)}
                                            className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-black/90 transition backdrop-blur-sm"
                                        >
                                            <Eye className="w-4 h-4" /> Ver imagem inteira
                                        </button>

                                        <div className="absolute top-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                                            {activeImageIndex + 1} / {selectedProperty.images.length}
                                        </div>
                                    </div>

                                    {/* Thumbnails */}
                                    {selectedProperty.images.length > 1 && (
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {selectedProperty.images.map((img, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setActiveImageIndex(idx)}
                                                    className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition ${idx === activeImageIndex ? 'border-blue-600 ring-2 ring-blue-300' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                                >
                                                    <img src={getImageUrl(img.url)} alt="" className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                    Nenhuma imagem cadastrada para este imóvel.
                                </div>
                            )}

                            {/* Price & Features */}
                            <div className="flex flex-wrap justify-between items-center bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                                <div>
                                    <span className="text-xs text-gray-500 font-semibold uppercase">Valor do Imóvel</span>
                                    <p className="text-3xl font-black text-blue-600">{formatCurrency(selectedProperty.price)}</p>
                                </div>
                                <div className="flex gap-4 text-sm text-gray-600 mt-2 sm:mt-0">
                                    {selectedProperty.condoFee ? (
                                        <div>
                                            <span className="text-xs text-gray-500 block">Condomínio</span>
                                            <span className="font-bold">{formatCurrency(selectedProperty.condoFee)}</span>
                                        </div>
                                    ) : null}
                                    {selectedProperty.taxFee ? (
                                        <div>
                                            <span className="text-xs text-gray-500 block">IPTU</span>
                                            <span className="font-bold">{formatCurrency(selectedProperty.taxFee)}</span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            {/* Key specs grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-gray-50 p-3 rounded-xl border text-center">
                                    <Bed className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                                    <span className="text-xs text-gray-500 block">Quartos</span>
                                    <span className="font-bold text-gray-800">{selectedProperty.features.bedrooms}</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl border text-center">
                                    <Bath className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                                    <span className="text-xs text-gray-500 block">Banheiros</span>
                                    <span className="font-bold text-gray-800">{selectedProperty.features.bathrooms}</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl border text-center">
                                    <Car className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                                    <span className="text-xs text-gray-500 block">Vagas</span>
                                    <span className="font-bold text-gray-800">{selectedProperty.features.parkingSpaces}</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl border text-center">
                                    <Maximize className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                                    <span className="text-xs text-gray-500 block">Área Útil</span>
                                    <span className="font-bold text-gray-800">{selectedProperty.features.usableArea} m²</span>
                                </div>
                            </div>

                            {/* Location & Description */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-blue-600" /> Endereço
                                    </h3>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border">
                                        {selectedProperty.location.street}, {selectedProperty.location.number} - {selectedProperty.location.neighborhood}<br />
                                        {selectedProperty.location.city} / {selectedProperty.location.state} — CEP: {selectedProperty.location.cep}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                                        <FileText className="w-4 h-4 text-blue-600" /> Área Total & Dimensões
                                    </h3>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border">
                                        Área Útil: {selectedProperty.features.usableArea} m²<br />
                                        Área Total: {selectedProperty.features.totalArea} m²<br />
                                        Suítes: {selectedProperty.features.suites || 0}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-bold text-gray-900">Descrição Completa</h3>
                                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border whitespace-pre-line leading-relaxed">
                                    {selectedProperty.description}
                                </p>
                            </div>

                            {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-bold text-gray-900">Comodidades & Diferenciais</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProperty.amenities.map((amenity, idx) => (
                                            <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-3 py-1 rounded-full font-medium">
                                                ✓ {amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Broker Contact Card */}
                            {selectedProperty.brokerId && (
                                <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                                    <div className="flex items-center gap-4">
                                        {selectedProperty.brokerId.avatarUrl ? (
                                            <img src={getImageUrl(selectedProperty.brokerId.avatarUrl)} alt={selectedProperty.brokerId.name} className="w-14 h-14 rounded-full object-cover border-2 border-white/30" />
                                        ) : (
                                            <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl border-2 border-white/30">
                                                {selectedProperty.brokerId.name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-xs uppercase tracking-wider text-blue-300 font-semibold">Corretor Responsável</span>
                                            <h4 className="text-lg font-bold">{selectedProperty.brokerId.name}</h4>
                                            <p className="text-xs text-gray-300">CRECI: {selectedProperty.brokerId.creci}</p>
                                        </div>
                                    </div>
                                    <a
                                        href={`https://wa.me/55${selectedProperty.brokerId.phone?.replace(/\D/g, '') || ''}?text=Olá%20${encodeURIComponent(selectedProperty.brokerId.name)},%20gostaria%20de%20saber%20mais%20sobre%20o%20imóvel:%20${encodeURIComponent(selectedProperty.title)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-md w-full sm:w-auto justify-center"
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
                <div className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4">
                    <button
                        onClick={() => setIsImageModalOpen(false)}
                        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition z-70"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        <img
                            src={getImageUrl(selectedProperty.images[activeImageIndex]?.url)}
                            alt="Imagem Inteira"
                            className="max-h-[90vh] max-w-[90vw] object-contain rounded shadow-2xl"
                        />

                        {selectedProperty.images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 text-white p-4 rounded-full hover:bg-white/30 transition backdrop-blur-sm"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 text-white p-4 rounded-full hover:bg-white/30 transition backdrop-blur-sm"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </>
                        )}

                        <div className="absolute bottom-6 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                            {activeImageIndex + 1} de {selectedProperty.images.length}
                        </div>
                    </div>
                </div>
            )}

            <footer className="bg-white border-t py-6 text-center text-xs text-gray-500 mt-12">
                <p>{tenant?.tradeName || 'Sistema Imobiliário'} — Todos os direitos reservados.</p>
            </footer>
        </div>
    );
};