export interface Brand {
  id: number;
  name: string;
  type: string;
  created_at: string;
}

export interface BrandPillar {
  id: number;
  name: string;
  created_at: string;
  brand: Brand;
}

export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface Country {
  id: number;
  name: string;
  official_name: string;
  iso2: string;
  iso3: string;
  flag_url: string;
  created_at: string;
}

export interface Subcategory {
  id: number;
  name: string;
  created_at: string;
}

export interface Product {
  id: number;
  pref: string;
  brand_type: string | null;
  brand_category: string;
  product_type: string;
  grouping: number;
  price: number;
  launch_date: string;
  discontinue_date: string;
  offering_number: string;
  sku: string;
  irc: string;
  material_description: string | null;
  material_tr: string | null;
  ean_upc: string;
  house: string;
  line: string;
  line_id: string;
  article_type: string;
  article_sub_type: string | null;
  division: string;
  icp_eur: string | null;
  icp_usd: string;
  factory: string;
  commodity_id: string;
  gender: string;
  size: string;
  length: string;
  height: string;
  width: string;
  volume: string;
  gross_weight: string;
  net_weight: string;
  units: string;
  cssp_trex_eur: string | null;
  cssp_trex_usd: string | null;
  shade: string | null;
  currency: string;
  is_innovation_product: boolean;
  created_at: string;
  brand: Brand;
  brand_pillar: BrandPillar;
  category: Category;
  country: Country;
  market: {
    created_at: string;
    id: number;
    name: string;
  } | null;
  subcategory: Subcategory;
  segment: {
    created_at: string;
    id: number;
    name: string;
  } | null;
  price_benchmark: {
    id: number;
    brand_id: number;
    brand_pillar_id: number | null;
    product_id: number;
    index_value: string;
    comment: string | null;
    created_at: string;
    brand: Brand;
    category: Category | null;
  } | null;
}
