import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Property, Tenant } from '../types';
import { SlidersHorizontal } from 'lucide-react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { PropertyCard } from './components/PropertyCard';
import { PropertyModal } from './components/PropertyModal';
import { ImageLightboxModal } from './components/ImageLightboxModal';

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
                <Header tenant={tenant} getImageUrl={getImageUrl} />

                <FilterBar
                    search={search}
                    setSearch={setSearch}
                    city={city}
                    setCity={setCity}
                    type={type}
                    setType={setType}
                    purpose={purpose}
                    setPurpose={setPurpose}
                    minPrice={minPrice}
                    setMinPrice={setMinPrice}
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                    handleCurrencyChange={handleCurrencyChange}
                    handleClearFilters={handleClearFilters}
                    hasActiveFilters={hasActiveFilters}
                />

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
                            {properties.map((property) => (
                                <PropertyCard
                                    key={property._id}
                                    property={property}
                                    onSelect={openPropertyModal}
                                    formatCurrency={formatCurrency}
                                    getImageUrl={getImageUrl}
                                    matchesSearch={matchesSearch}
                                    matchesCity={matchesCity}
                                    matchesPurpose={matchesPurpose}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {selectedProperty && (
                <PropertyModal
                    property={selectedProperty}
                    onClose={closePropertyModal}
                    activeImageIndex={activeImageIndex}
                    setActiveImageIndex={setActiveImageIndex}
                    openImageLightbox={() => setIsImageModalOpen(true)}
                    formatCurrency={formatCurrency}
                    getImageUrl={getImageUrl}
                    nextImage={nextImage}
                    prevImage={prevImage}
                />
            )}

            <ImageLightboxModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                property={selectedProperty}
                activeImageIndex={activeImageIndex}
                getImageUrl={getImageUrl}
                nextImage={nextImage}
                prevImage={prevImage}
            />

            <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-16">
                <p>{tenant?.tradeName || 'Sistema Imobiliário'} — Todos os direitos reservados.</p>
            </footer>
        </div>
    );
};