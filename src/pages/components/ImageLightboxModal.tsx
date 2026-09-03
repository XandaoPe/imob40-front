import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Property } from '../../types';

interface ImageLightboxModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: Property | null;
    activeImageIndex: number;
    getImageUrl: (url: string) => string;
    nextImage: (e?: React.MouseEvent) => void;
    prevImage: (e?: React.MouseEvent) => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
    isOpen,
    onClose,
    property,
    activeImageIndex,
    getImageUrl,
    nextImage,
    prevImage
}) => {
    if (!isOpen || !property || !property.images || property.images.length === 0) return null;

    return (
        <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition z-70"
            >
                <X className="w-6 h-6" />
            </button>

            <div className="relative w-full h-full flex items-center justify-center p-4">
                <img
                    src={getImageUrl(property.images[activeImageIndex]?.url)}
                    alt="Imagem Inteira"
                    className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
                />

                {property.images.length > 1 && (
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
                    {activeImageIndex + 1} de {property.images.length}
                </div>
            </div>
        </div>
    );
};