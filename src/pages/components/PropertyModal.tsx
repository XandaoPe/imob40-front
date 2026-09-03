import React from 'react';
import { X, ChevronLeft, ChevronRight, Eye, Bed, Bath, Car, Maximize, MapPin, FileText, MessageCircle } from 'lucide-react';
import { Property } from '../../types';

interface PropertyModalProps {
    property: Property;
    onClose: () => void;
    activeImageIndex: number;
    setActiveImageIndex: React.Dispatch<React.SetStateAction<number>>;
    openImageLightbox: () => void;
    formatCurrency: (val: number) => string;
    getImageUrl: (url: string) => string;
    nextImage: (e?: React.MouseEvent) => void;
    prevImage: (e?: React.MouseEvent) => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
    property,
    onClose,
    activeImageIndex,
    setActiveImageIndex,
    openImageLightbox,
    formatCurrency,
    getImageUrl,
    nextImage,
    prevImage
}) => {
    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-auto relative animate-in fade-in zoom-in-95 duration-200">
                <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center z-20">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full">
                                {property.purpose === 'SALE' ? 'Venda' : 'Locação'}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 uppercase">{property.type}</span>
                        </div>
                        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{property.title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 sm:p-8 space-y-8">
                    {property.images && property.images.length > 0 ? (
                        <div className="space-y-3">
                            <div className="relative h-80 sm:h-96 bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center group">
                                <img
                                    src={getImageUrl(property.images[activeImageIndex]?.url)}
                                    alt={property.title}
                                    className="max-h-full max-w-full object-contain cursor-pointer"
                                    onClick={openImageLightbox}
                                    title="Clique para ver imagem inteira"
                                />

                                {property.images.length > 1 && (
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
                                    onClick={openImageLightbox}
                                    className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition backdrop-blur-md shadow-lg"
                                >
                                    <Eye className="w-4 h-4" /> Ver tela cheia
                                </button>

                                <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-md">
                                    {activeImageIndex + 1} / {property.images.length}
                                </div>
                            </div>

                            {property.images.length > 1 && (
                                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                                    {property.images.map((img, idx) => (
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

                    <div className="flex flex-wrap justify-between items-center bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                        <div>
                            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Valor do Imóvel</span>
                            <p className="text-3xl font-black text-blue-600 tracking-tight">{formatCurrency(property.price)}</p>
                        </div>
                        <div className="flex gap-6 text-sm text-slate-600 mt-3 sm:mt-0">
                            {property.condoFee ? (
                                <div>
                                    <span className="text-xs text-slate-400 block font-medium">Condomínio</span>
                                    <span className="font-bold text-slate-800">{formatCurrency(property.condoFee)}</span>
                                </div>
                            ) : null}
                            {property.taxFee ? (
                                <div>
                                    <span className="text-xs text-slate-400 block font-medium">IPTU</span>
                                    <span className="font-bold text-slate-800">{formatCurrency(property.taxFee)}</span>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                            <Bed className="w-5 h-5 mx-auto text-blue-600 mb-1.5" />
                            <span className="text-xs text-slate-400 block font-medium">Quartos</span>
                            <span className="font-bold text-slate-800">{property.features.bedrooms}</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                            <Bath className="w-5 h-5 mx-auto text-blue-600 mb-1.5" />
                            <span className="text-xs text-slate-400 block font-medium">Banheiros</span>
                            <span className="font-bold text-slate-800">{property.features.bathrooms}</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                            <Car className="w-5 h-5 mx-auto text-blue-600 mb-1.5" />
                            <span className="text-xs text-slate-400 block font-medium">Vagas</span>
                            <span className="font-bold text-slate-800">{property.features.parkingSpaces}</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                            <Maximize className="w-5 h-5 mx-auto text-blue-600 mb-1.5" />
                            <span className="text-xs text-slate-400 block font-medium">Área Útil</span>
                            <span className="font-bold text-slate-800">{property.features.usableArea} m²</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-600" /> Endereço
                            </h3>
                            <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
                                {property.location.street}, {property.location.number} - {property.location.neighborhood}<br />
                                {property.location.city} / {property.location.state} — CEP: {property.location.cep}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" /> Dimensões
                            </h3>
                            <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
                                Área Útil: {property.features.usableArea} m²<br />
                                Área Total: {property.features.totalArea} m²<br />
                                Suítes: {property.features.suites || 0}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-bold text-slate-900">Descrição Completa</h3>
                        <p className="text-sm text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-100 whitespace-pre-line leading-relaxed">
                            {property.description}
                        </p>
                    </div>

                    {property.amenities && property.amenities.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-bold text-slate-900">Comodidades & Diferenciais</h3>
                            <div className="flex flex-wrap gap-2">
                                {property.amenities.map((amenity, idx) => (
                                    <span key={idx} className="bg-blue-50/80 text-blue-700 border border-blue-200/60 text-xs px-3.5 py-1.5 rounded-xl font-medium">
                                        ✓ {amenity}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {property.brokerId && (
                        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                            <div className="flex items-center gap-4 text-center sm:text-left">
                                {property.brokerId.avatarUrl ? (
                                    <img src={getImageUrl(property.brokerId.avatarUrl)} alt={property.brokerId.name} className="w-16 h-16 rounded-full object-cover border-2 border-white/20 shadow-md" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl border-2 border-white/20 shadow-md">
                                        {property.brokerId.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <span className="text-xs uppercase tracking-wider text-blue-300 font-semibold">Corretor Responsável</span>
                                    <h4 className="text-lg font-bold">{property.brokerId.name}</h4>
                                    <p className="text-xs text-slate-300">CRECI: {property.brokerId.creci}</p>
                                </div>
                            </div>
                            <a
                                href={`https://wa.me/55${property.brokerId.phone?.replace(/\D/g, '') || ''}?text=Olá%20${encodeURIComponent(property.brokerId.name)},%20gostaria%20de%20saber%20mais%20sobre%20o%20imóvel:%20${encodeURIComponent(property.title)}`}
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
    );
};