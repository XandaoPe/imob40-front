import React from 'react';
import { Upload, Trash2, ArrowUp, ArrowDown, Star } from 'lucide-react';

export interface PropertyImage {
    url: string;
    isCover: boolean;
    order: number;
}

interface PropertyImageManagerProps {
    images: PropertyImage[];
    onChange: (images: PropertyImage[]) => void;
    onClear?: () => void;
}

export const PropertyImageManager: React.FC<PropertyImageManagerProps> = ({ images, onChange, onClear }) => {
    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1024;
                    const MAX_HEIGHT = 1024;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.75));
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onClear) onClear();
        const files = Array.from(e.target.files || []);
        const newImages = [...images];
        for (let i = 0; i < files.length; i++) {
            const compressedBase64 = await resizeImage(files[i]);
            const currentLength = newImages.length;
            newImages.push({
                url: compressedBase64,
                isCover: currentLength === 0,
                order: currentLength
            });
        }
        onChange(newImages);
    };

    const removeImage = (index: number) => {
        if (onClear) onClear();
        const updated = images.filter((_, i) => i !== index);
        const reindexed = updated.map((img, idx) => ({
            ...img,
            order: idx,
            isCover: idx === 0 ? true : img.isCover
        }));
        if (reindexed.length > 0 && !reindexed.some(img => img.isCover)) {
            reindexed[0].isCover = true;
        }
        onChange(reindexed);
    };

    const setCoverImage = (index: number) => {
        if (onClear) onClear();
        const updated = images.map((img, idx) => ({
            ...img,
            isCover: idx === index
        }));
        onChange(updated);
    };

    const moveImage = (index: number, direction: 'up' | 'down') => {
        if (onClear) onClear();
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= images.length) return;

        const newImages = [...images];
        const temp = newImages[index];
        newImages[index] = newImages[targetIndex];
        newImages[targetIndex] = temp;

        const reordered = newImages.map((img, idx) => ({
            ...img,
            order: idx
        }));
        onChange(reordered);
    };

    return (
        <div className="md:col-span-3">
            <label className="block font-medium text-gray-600 dark:text-gray-300 mb-1">Fotos do Imóvel & Ordem de Exibição (Capa)</label>
            <div className="border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-lg p-4 text-center bg-blue-50/50 dark:bg-gray-800 hover:bg-blue-100/50 transition cursor-pointer relative">
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center space-y-1">
                    <Upload className="w-8 h-8 text-blue-500" />
                    <p className="font-semibold text-gray-700 dark:text-gray-200 text-sm">Clique aqui ou arraste as fotos</p>
                    <p className="text-gray-500 text-xs">Selecione várias fotos (compactação automática). Defina qual será a capa e a ordem de exibição.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                {images.map((img, idx) => (
                    <div key={idx} className={`relative border rounded-lg p-2 bg-white dark:bg-gray-800 flex flex-col items-center gap-2 ${img.isCover ? 'border-blue-500 ring-2 ring-blue-400' : 'border-gray-300 dark:border-gray-700'}`}>
                        <div className="relative w-full h-24 bg-gray-100 dark:bg-gray-900 rounded overflow-hidden flex items-center justify-center">
                            <img src={img.url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                            {img.isCover && (
                                <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                                    Capa
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                                title="Remover imagem"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="flex items-center justify-between w-full text-xs gap-1">
                            <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveImage(idx, 'up')}
                                className="p-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 disabled:opacity-40"
                                title="Mover para esquerda/cima"
                            >
                                <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setCoverImage(idx)}
                                className={`px-2 py-0.5 rounded font-semibold text-[10px] flex items-center gap-1 ${img.isCover ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                                title="Definir como Capa"
                            >
                                <Star className="w-3 h-3" /> {img.isCover ? 'Capa' : 'Tornar Capa'}
                            </button>
                            <button
                                type="button"
                                disabled={idx === images.length - 1}
                                onClick={() => moveImage(idx, 'down')}
                                className="p-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 disabled:opacity-40"
                                title="Mover para direita/baixo"
                            >
                                <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};