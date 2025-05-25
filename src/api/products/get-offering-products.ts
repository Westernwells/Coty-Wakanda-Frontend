import { axios } from "@/lib/axios";

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

export interface Market {
  id: number;
  name: string;
  created_at: string;
}

export interface Subcategory {
  id: number;
  name: string;
  created_at: string;
}

export interface Segment {
  id: number;
  name: string;
  created_at: string;
}

export interface OfferingProductData {
  id: number;
  pref: string;
  brand_type: string | null;
  brand_category: string | null;
  product_type: string;
  grouping: number;
  price: number;
  launch_date: string | null;
  discontinue_date: string | null;
  offering_number: string | null;
  sku: string;
  irc: string;
  material_description: string | null;
  material_tr: string | null;
  ean_upc: string | null;
  house: string | null;
  line: string | null;
  line_id: string | null;
  article_type: string | null;
  article_sub_type: string | null;
  division: string | null;
  icp_eur: string | null;
  icp_usd: string | null;
  factory: string | null;
  commodity_id: string | null;
  gender: string | null;
  size: string | null;
  length: string | null;
  height: string | null;
  width: string | null;
  volume: string | null;
  gross_weight: string | null;
  net_weight: string | null;
  units: string | null;
  cssp_trex_eur: string | null;
  cssp_trex_usd: string | null;
  shade: string | null;
  is_innovation_product: boolean;
  created_at: string;
  brand: {
    id: number;
    name: string;
    type: string;
    created_at: string;
  } | null;
  brand_pillar: {
    id: number;
    name: string;
    created_at: string;
    brand: {
      id: number;
      name: string;
      type: string;
      created_at: string;
    };
  } | null;
  category: {
    id: number;
    name: string;
    created_at: string;
  } | null;
  country: {
    id: number;
    name: string;
    official_name: string;
    iso2: string;
    iso3: string;
    flag_url: string;
    created_at: string;
  } | null;
  market: {
    id: number;
    name: string;
    created_at: string;
  } | null;
  subcategory: {
    id: number;
    name: string;
    created_at: string;
  } | null;
  segment: {
    id: number;
    name: string;
    created_at: string;
  } | null;
  price_benchmark: import("@/types").PriceBenchmark | null;
}

export interface DistributorData {
  product: Record<string, unknown> | null;
  irc: string;
  billing_price: number | null;
  rrsp: number | null;
  icp_eur: number | null;
  icp_usd: number | null;
  french_eur: number | null;
  french_usd: number | null;
  c1: number | null;
}

export interface Distributor {
  id: number;
  name: string;
  currency: string | null;
  data: DistributorData[];
}

export interface GetOfferingProductsResponse {
  message: string;
  data: {
    products: OfferingProductData[];
    distributors: Distributor[];
  };
  meta?: {
    cursor: number;
    page_size: number;
    has_previous: boolean;
    has_next: boolean;
    total: number;
  };
}

export async function getOfferingProducts(
  innovationId: string | number,
  offeringId: string | number
): Promise<GetOfferingProductsResponse> {
  const response = await axios.get(
    `/innovations/${innovationId}/offerings/${offeringId}/products`
  );
  return response.data;
}
