

export type Meta = {
    page: number;
    total: number;
    perPage: number;
}

export type Distributor = {
    id: number;
    name: string;
    type: string;
    company_registration_number: string;
    currency: string;
    contact_person: string;
    contact_email: string;
    mirror: Mirror;
    regions: Region[];
    markets: Market[];
    categories: Category[];
    brands: Brand[];
    coefficients: Coefficient[];
}

export type Mirror = {
    group_one: number;
    group_two: number;
}

export type Region = {
    id: number;
    name: string;
    active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
    pivot: {
        distributor_id: number;
        region_id: number;
    };
}

export type Market = {
    id: number;
    region_id: number;
    name: string;
    active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
    pivot: {
        distributor_id: number;
        market_id: number;
    };
}

export type Category = {
    id: number;
    name: string;
    active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
    pivot: {
        distributor_id: number;
        category_id: number;
    };
}

export type Brand = {
    id: number;
    brand_type_id: number;
    name: string;
    active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
    pivot: {
        distributor_id: number;
        brand_id: number;
    };
}

export type Coefficient = {
    id: number;
    value: string;
    brand: Brand;
    category: Category;
    pref: Pref;
}

export type Pref = {
    id: number;
    name: string;
    active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
}

export type LoginValues = {
  email: string,
  password: string,
}