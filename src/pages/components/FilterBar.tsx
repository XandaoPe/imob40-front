import React from 'react';
import { Search, MapPin, Trash2 } from 'lucide-react';

interface FilterBarProps {
    search: string;
    setSearch: (val: string) => void;
    city: string;
    setCity: (val: string) => void;
    type: string;
    setType: (val: string) => void;
    purpose: string;
    setPurpose: (val: string) => void;
    minPrice: string;
    setMinPrice: (val: string) => void;
    maxPrice: string;
    setMaxPrice: (val: string) => void;
    handleCurrencyChange: (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
    search, setSearch,
    city, setCity,
    type, setType,
    purpose, setPurpose,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    handleCurrencyChange,
    handleClearFilters,
    hasActiveFilters
}) => {
    return (
        <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-6 px-4 sm:px-6 overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-4 text-center">
                    Encontre o imóvel ideal para você
                </h1>

                <div className="bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-2xl border border-white/20 text-slate-800 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5 items-center">
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

                        <select
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            className="w-full lg:col-span-1 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
                        >
                            <option value="">Finalidade</option>
                            <option value="SALE">Venda</option>
                            <option value="RENT">Locação</option>
                        </select>

                        <div className="lg:col-span-1">
                            <input
                                type="text"
                                placeholder="Preço Mín."
                                value={minPrice}
                                onChange={(e) => handleCurrencyChange(e, setMinPrice)}
                                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                            />
                        </div>

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
    );
};