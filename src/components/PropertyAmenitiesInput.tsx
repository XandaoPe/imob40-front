import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface PropertyAmenitiesInputProps {
    amenities: string[];
    onChange: (amenities: string[]) => void;
    onClear?: () => void;
}

export const PropertyAmenitiesInput: React.FC<PropertyAmenitiesInputProps> = ({ amenities, onChange, onClear }) => {
    const [newAmenity, setNewAmenity] = useState('');

    const addAmenity = () => {
        if (onClear) onClear();
        const trimmed = newAmenity.trim();
        if (trimmed && !amenities.includes(trimmed)) {
            onChange([...amenities, trimmed]);
            setNewAmenity('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addAmenity();
        }
    };

    const removeAmenity = (indexToRemove: number) => {
        if (onClear) onClear();
        onChange(amenities.filter((_, idx) => idx !== indexToRemove));
    };

    return (
        <div className="md:col-span-3">
            <label className="block font-medium text-gray-600 dark:text-gray-300 mb-1">Diferenciais / Comodidades (Digite e pressione Enter)</label>
            <div className="flex gap-2 mb-2">
                <input
                    type="text"
                    value={newAmenity}
                    onChange={e => setNewAmenity(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ex: Piscina, Churrasqueira..."
                    className="flex-1 border dark:border-gray-700 p-1.5 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <button
                    type="button"
                    onClick={addAmenity}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded font-semibold flex items-center gap-1 transition"
                >
                    <Plus className="w-4 h-4" /> Adicionar
                </button>
            </div>
            {amenities.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-2 border dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800">
                    {amenities.map((amenity, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
                            {amenity}
                            <button
                                type="button"
                                onClick={() => removeAmenity(idx)}
                                className="text-blue-600 dark:text-blue-300 hover:text-red-600 dark:hover:text-red-400 transition"
                                title="Excluir diferencial"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400 text-xs italic">Nenhum diferencial cadastrado. Somente os cadastrados serão exibidos.</p>
            )}
        </div>
    );
};