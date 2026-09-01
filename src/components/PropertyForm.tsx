import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Property } from '../types';
import { useTenantAuth } from '../context/TenantAuthContext';
import { X, Check } from 'lucide-react';
import { PropertyAmenitiesInput } from './PropertyAmenitiesInput';
import { PropertyImageManager, PropertyImage } from './PropertyImageManager';
import { PropertyList } from './PropertyList';
import { PropertyLogsModal } from './PropertyLogsModal';

interface PropertyFormProps {
    onSuccess: (message: string) => void;
    onError: (msg: string) => void;
    onClearMessages?: () => void;
}

const SP_CITIES = [
    "Presidente Epitácio", "São Paulo", "Campinas", "Santos", "Ribeirão Preto",
    "Sorocaba", "São José dos Campos", "Presidente Prudente", "Bauru", "Marília",
    "Araçatuba", "Barretos", "Franca", "Piracicaba", "Jundiaí", "São Carlos"
];

export const PropertyForm: React.FC<PropertyFormProps> = ({ onSuccess, onError, onClearMessages }) => {
    const { tenantId } = useTenantAuth();
    const [propertiesList, setPropertiesList] = useState<Property[]>([]);
    const [citySearch, setCitySearch] = useState('Presidente Epitácio');
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [showLogsModal, setShowLogsModal] = useState(false);
    const [changeLogsList, setChangeLogsList] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
    const isAdmin = currentUser?.role === 'ADMIN' || isSuperAdmin;
    const activeTenantId = tenantId || currentUser?.tenantId;
    const loggedUserId = currentUser?._id || currentUser?.id || '';

    const [propertyForm, setPropertyForm] = useState({
        title: '',
        description: '',
        type: 'HOUSE',
        purpose: 'SALE',
        price: '',
        condoFee: '',
        taxFee: '',
        cep: '',
        street: '',
        number: '',
        neighborhood: '',
        city: 'Presidente Epitácio',
        state: 'SP',
        bedrooms: '3',
        bathrooms: '2',
        parkingSpaces: '2',
        usableArea: '150',
        totalArea: '250',
        amenities: [] as string[],
        images: [] as PropertyImage[]
    });

    const triggerSuccess = (message: string) => {
        onSuccess(message);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            if (onClearMessages) onClearMessages();
        }, 4000);
    };

    const triggerError = (msg: string) => {
        onError(msg);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            if (onClearMessages) onClearMessages();
        }, 4000);
    };

    const fetchProperties = () => {
        if (!activeTenantId && !isSuperAdmin) return;
        const endpoint = isSuperAdmin ? '/properties/tenant/all?role=SUPER_ADMIN' : `/properties/tenant/${activeTenantId}`;
        api.get(endpoint)
            .then(res => setPropertiesList(res.data))
            .catch(() => setPropertiesList([]));
    };

    useEffect(() => {
        setPropertiesList([]);
        if (activeTenantId || isSuperAdmin) {
            fetchProperties();
        }
    }, [activeTenantId]);

    const fetchLogs = async () => {
        setLoadingLogs(true);
        try {
            const endpoint = isSuperAdmin
                ? '/properties/logs/all'
                : `/properties/logs/tenant/${activeTenantId}`;
            const res = await api.get(endpoint);
            setChangeLogsList(res.data);
            setShowLogsModal(true);
        } catch (err: any) {
            triggerError('Erro ao carregar logs de alterações.');
        } finally {
            setLoadingLogs(false);
        }
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onClearMessages) onClearMessages();
        let value = e.target.value.replace(/\D/g, '');
        if (value) {
            const numberVal = (Number(value) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            setPropertyForm(prev => ({ ...prev, price: numberVal }));
        } else {
            setPropertyForm(prev => ({ ...prev, price: '' }));
        }
    };

    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cepVal = e.target.value.replace(/\D/g, '');
        if (cepVal.length === 8) {
            try {
                const res = await fetch(`https://viacep.com.br/ws/${cepVal}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setPropertyForm(prev => ({
                        ...prev,
                        cep: e.target.value,
                        street: data.logradouro || '',
                        neighborhood: data.bairro || '',
                        city: data.localidade || '',
                        state: data.uf || 'SP'
                    }));
                    setCitySearch(data.localidade || '');
                }
            } catch (err) {
                console.error("Erro ao buscar CEP", err);
            }
        }
    };

    const handleEdit = async (prop: Property) => {
        if (onClearMessages) onClearMessages();

        setEditingId(prop._id);
        const formattedPrice = prop.price ? prop.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '';

        const normalizedImages = (prop.images || []).map((img, idx) => ({
            url: img.url,
            isCover: img.isCover !== undefined ? img.isCover : (idx === 0),
            order: img.order !== undefined ? img.order : idx
        }));

        setPropertyForm({
            title: prop.title || '',
            description: prop.description || '',
            type: prop.type || 'HOUSE',
            purpose: prop.purpose || 'SALE',
            price: formattedPrice,
            condoFee: prop.condoFee?.toString() || '',
            taxFee: prop.taxFee?.toString() || '',
            cep: prop.location?.cep || '',
            street: prop.location?.street || '',
            number: prop.location?.number || '',
            neighborhood: prop.location?.neighborhood || '',
            city: prop.location?.city || 'Presidente Epitácio',
            state: prop.location?.state || 'SP',
            bedrooms: prop.features?.bedrooms?.toString() || '3',
            bathrooms: prop.features?.bathrooms?.toString() || '2',
            parkingSpaces: prop.features?.parkingSpaces?.toString() || '2',
            usableArea: prop.features?.usableArea?.toString() || '150',
            totalArea: prop.features?.totalArea?.toString() || '250',
            amenities: prop.amenities || [],
            images: normalizedImages
        });
        setCitySearch(prop.location?.city || 'Presidente Epitácio');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este imóvel?')) {
            try {
                await api.delete(`/properties/${id}`);
                triggerSuccess('Imóvel excluído com sucesso!');
                fetchProperties();
            } catch (err: any) {
                triggerError(err.response?.data?.error || 'Erro ao excluir imóvel.');
            }
        }
    };

    const cancelEdit = () => {
        if (onClearMessages) onClearMessages();
        setEditingId(null);
        setPropertyForm({
            title: '',
            description: '',
            type: 'HOUSE',
            purpose: 'SALE',
            price: '',
            condoFee: '',
            taxFee: '',
            cep: '',
            street: '',
            number: '',
            neighborhood: '',
            city: 'Presidente Epitácio',
            state: 'SP',
            bedrooms: '3',
            bathrooms: '2',
            parkingSpaces: '2',
            usableArea: '150',
            totalArea: '250',
            amenities: [],
            images: []
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (onClearMessages) onClearMessages();

        if (!activeTenantId || !loggedUserId) {
            triggerError('Tenant ID e usuário logado são obrigatórios.');
            return;
        }

        const cleanPrice = Number(propertyForm.price.replace(/[^\d]/g, '')) / 100;

        try {
            const payload = {
                tenantId: activeTenantId,
                brokerId: loggedUserId,
                userName: currentUser?.name || 'Usuário',
                title: propertyForm.title,
                description: propertyForm.description,
                type: propertyForm.type,
                purpose: propertyForm.purpose,
                price: cleanPrice,
                condoFee: Number(propertyForm.condoFee || 0),
                taxFee: Number(propertyForm.taxFee || 0),
                location: {
                    cep: propertyForm.cep,
                    street: propertyForm.street,
                    number: propertyForm.number,
                    neighborhood: propertyForm.neighborhood,
                    city: propertyForm.city,
                    state: propertyForm.state,
                    coordinates: { type: 'Point', coordinates: [-52.11, -21.76] }
                },
                features: {
                    bedrooms: propertyForm.type === 'LAND' ? 0 : Number(propertyForm.bedrooms),
                    suites: propertyForm.type === 'LAND' ? 0 : Number(propertyForm.bedrooms),
                    bathrooms: propertyForm.type === 'LAND' ? 0 : Number(propertyForm.bathrooms),
                    parkingSpaces: propertyForm.type === 'LAND' ? 0 : Number(propertyForm.parkingSpaces),
                    usableArea: Number(propertyForm.usableArea),
                    totalArea: Number(propertyForm.totalArea)
                },
                amenities: propertyForm.amenities,
                images: propertyForm.images
            };

            if (editingId) {
                await api.put(`/properties/${editingId}`, payload);
                triggerSuccess('Imóvel atualizado com sucesso!');
                setEditingId(null);
            } else {
                const response = await api.post('/properties', payload);
                triggerSuccess(`Imóvel cadastrado com sucesso! ID: ${response.data._id}`);
            }

            cancelEdit();
            fetchProperties();
        } catch (error: any) {
            triggerError(error.response?.data?.error || 'Erro ao salvar imóvel.');
        }
    };

    const filteredCities = SP_CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()));

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-2 text-xs md:text-sm" onChange={() => { if (onClearMessages) onClearMessages(); }}>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-base font-bold text-gray-700 dark:text-gray-200">
                        {editingId ? 'Editar Imóvel' : 'Cadastrar Imóvel'}
                    </h2>
                    {editingId && (
                        <button type="button" onClick={cancelEdit} className="text-red-500 hover:underline flex items-center gap-1 text-xs">
                            <X className="w-4 h-4" /> Cancelar Edição
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                        <label className="block font-medium text-gray-600 dark:text-gray-300">Tenant ID</label>
                        <input
                            type="text"
                            disabled
                            value={activeTenantId || ''}
                            className="w-full border dark:border-gray-700 p-1.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 font-mono text-xs"
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-600 dark:text-gray-300">Corretor Responsável</label>
                        <input
                            type="text"
                            disabled
                            value={currentUser?.name ? `${currentUser.name} (Logado)` : loggedUserId}
                            className="w-full border dark:border-gray-700 p-1.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs"
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-600 dark:text-gray-300">Tipo</label>
                        <select
                            value={propertyForm.type}
                            onChange={e => setPropertyForm({ ...propertyForm, type: e.target.value })}
                            className="w-full border dark:border-gray-700 p-1.5 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                            <option value="HOUSE">Casa</option>
                            <option value="APARTMENT">Apartamento</option>
                            <option value="LAND">Terreno</option>
                            <option value="COMMERCIAL">Comercial</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block font-medium text-gray-600 dark:text-gray-300">Título do Imóvel</label>
                        <input
                            type="text"
                            required
                            value={propertyForm.title}
                            onChange={e => setPropertyForm({ ...propertyForm, title: e.target.value })}
                            className="w-full border dark:border-gray-700 p-1.5 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            placeholder="Casa Moderna..."
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-600 dark:text-gray-300">Finalidade</label>
                        <select
                            value={propertyForm.purpose}
                            onChange={e => setPropertyForm({ ...propertyForm, purpose: e.target.value })}
                            className="w-full border dark:border-gray-700 p-1.5 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                            <option value="SALE">Venda</option>
                            <option value="RENT">Locação</option>
                        </select>
                    </div>

                    <div className="md:col-span-3">
                        <label className="block font-medium text-gray-600 dark:text-gray-300">Descrição</label>
                        <textarea
                            rows={1}
                            required
                            value={propertyForm.description}
                            onChange={e => setPropertyForm({ ...propertyForm, description: e.target.value })}
                            onFocus={(e) => e.target.rows = 4}
                            onBlur={(e) => { if (!e.target.value) e.target.rows = 1; }}
                            className="w-full border dark:border-gray-700 p-1.5 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all resize-y"
                            placeholder="Resumo objetivo do imóvel (clique para expandir)..."
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-600 dark:text-gray-300">Preço (R$)</label>
                        <input
                            type="text"
                            required
                            value={propertyForm.price}
                            onChange={handlePriceChange}
                            className="w-full border dark:border-gray-700 p-1.5 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            placeholder="R$ 0,00"
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-600 dark:text-gray-300">CEP</label>
                        <input
                            type="text"
                            required
                            value={propertyForm.cep}
                            onChange={e => setPropertyForm({ ...propertyForm, cep: e.target.value })}
                            onBlur={handleCepBlur}
                            placeholder="00000-000"
                            className="w-full border dark:border-gray-700 p-1.5 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div className="relative">
                        <label className="block font-medium text-gray-600 dark:text-gray-300">Cidade (SP)</label>
                        <input
                            type="text"
                            required
                            value={citySearch}
                            onChange={e => {
                                setCitySearch(e.target.value);
                                setShowCityDropdown(true);
                                setPropertyForm({ ...propertyForm, city: e.target.value });
                            }}
                            onFocus={() => setShowCityDropdown(true)}
                            className="w-full border dark:border-gray-700 p-1.5 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                        {showCityDropdown && filteredCities.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-md max-h-32 overflow-y-auto">
                                {filteredCities.map((c, idx) => (
                                    <li
                                        key={idx}
                                        onClick={() => {
                                            setCitySearch(c);
                                            setPropertyForm({ ...propertyForm, city: c });
                                            setShowCityDropdown(false);
                                        }}
                                        className="p-1.5 hover:bg-blue-100 dark:hover:bg-gray-700 cursor-pointer"
                                    >
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div>
                        <label className="block font-medium text-gray-600 dark:text-gray-300">Bairro</label>
                        <input
                            type="text"
                            required
                            value={propertyForm.neighborhood}
                            onChange={e => setPropertyForm({ ...propertyForm, neighborhood: e.target.value })}
                            className="w-full border dark:border-gray-700 p-1.5 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-600 dark:text-gray-300">Rua</label>
                        <input
                            type="text"
                            required
                            value={propertyForm.street}
                            onChange={e => setPropertyForm({ ...propertyForm, street: e.target.value })}
                            className="w-full border dark:border-gray-700 p-1.5 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-600 dark:text-gray-300">Número</label>
                        <input
                            type="text"
                            required
                            value={propertyForm.number}
                            onChange={e => setPropertyForm({ ...propertyForm, number: e.target.value })}
                            className="w-full border dark:border-gray-700 p-1.5 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    {propertyForm.type !== 'LAND' && (
                        <div>
                            <label className="block font-medium text-gray-600 dark:text-gray-300">Quartos / Banheiros / Vagas</label>
                            <div className="grid grid-cols-3 gap-1">
                                <input
                                    type="number"
                                    value={propertyForm.bedrooms}
                                    onChange={e => setPropertyForm({ ...propertyForm, bedrooms: e.target.value })}
                                    className="border dark:border-gray-700 p-1 rounded bg-white dark:bg-gray-800"
                                    placeholder="Qtos"
                                />
                                <input
                                    type="number"
                                    value={propertyForm.bathrooms}
                                    onChange={e => setPropertyForm({ ...propertyForm, bathrooms: e.target.value })}
                                    className="border dark:border-gray-700 p-1 rounded bg-white dark:bg-gray-800"
                                    placeholder="Banh"
                                />
                                <input
                                    type="number"
                                    value={propertyForm.parkingSpaces}
                                    onChange={e => setPropertyForm({ ...propertyForm, parkingSpaces: e.target.value })}
                                    className="border dark:border-gray-700 p-1 rounded bg-white dark:bg-gray-800"
                                    placeholder="Vagas"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block font-medium text-gray-600 dark:text-gray-300">Área Útil (m²)</label>
                        <input
                            type="number"
                            value={propertyForm.usableArea}
                            onChange={e => setPropertyForm({ ...propertyForm, usableArea: e.target.value })}
                            className="w-full border dark:border-gray-700 p-1.5 rounded bg-white dark:bg-gray-800"
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-600 dark:text-gray-300">Área Total (m²)</label>
                        <input
                            type="number"
                            value={propertyForm.totalArea}
                            onChange={e => setPropertyForm({ ...propertyForm, totalArea: e.target.value })}
                            className="w-full border dark:border-gray-700 p-1.5 rounded bg-white dark:bg-gray-800"
                        />
                    </div>

                    <PropertyAmenitiesInput
                        amenities={propertyForm.amenities}
                        onChange={amenities => setPropertyForm(prev => ({ ...prev, amenities }))}
                        onClear={onClearMessages}
                    />

                    <PropertyImageManager
                        images={propertyForm.images}
                        onChange={images => setPropertyForm(prev => ({ ...prev, images }))}
                        onClear={onClearMessages}
                    />
                </div>

                <div className="flex gap-2 mt-2">
                    <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2">
                        {editingId ? <Check className="w-4 h-4" /> : null}
                        {editingId ? 'Salvar Alterações' : 'Cadastrar Imóvel'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={cancelEdit} className="bg-gray-500 text-white font-bold px-4 py-2 rounded hover:bg-gray-600 transition">
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            <hr className="my-4 border-gray-300 dark:border-gray-700" />

            <PropertyList
                propertiesList={propertiesList}
                isSuperAdmin={isSuperAdmin}
                isAdmin={isAdmin}
                loadingLogs={loadingLogs}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onFetchLogs={fetchLogs}
            />

            <PropertyLogsModal
                isOpen={showLogsModal}
                onClose={() => setShowLogsModal(false)}
                changeLogsList={changeLogsList}
                isSuperAdmin={isSuperAdmin}
            />
        </div>
    );
};