export interface Tenant {
    _id: string;
    name: string;
    tradeName: string;
    cnpj: string;
    creci: string;
    logoUrl?: string;
    domain?: string;
    settings: {
        primaryColor: string;
        whatsappContact: string;
    };
}

export interface Broker {
    _id: string;
    name: string;
    email: string;
    creci: string;
    phone: string;
    avatarUrl?: string;
    bio?: string;
    role: 'ADMIN' | 'MANAGER' | 'BROKER';
    isActive?: boolean;
}

export interface PropertyImage {
    url: string;
    isCover: boolean;
    order: number;
}

export interface Property {
    _id: string;
    tenantId: string;
    brokerId: Broker;
    title: string;
    description: string;
    type: 'HOUSE' | 'APARTMENT' | 'LAND' | 'COMMERCIAL';
    purpose: 'SALE' | 'RENT';
    price: number;
    condoFee?: number;
    taxFee?: number;
    location: {
        cep: string;
        street: string;
        number: string;
        neighborhood: string;
        city: string;
        state: string;
    };
    features: {
        bedrooms: number;
        suites: number;
        bathrooms: number;
        parkingSpaces: number;
        usableArea: number;
        totalArea: number;
    };
    amenities: string[];
    images: PropertyImage[];
    status: string;
}