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

export interface OfferingProduct {
  id: number;
  pref: string;
  product_type: string;
  grouping: number | null;
  price: number;
  launch_date: string | null;
  discontinue_date: string | null;
  offering_number: string | null;
  sku: string;
  irc: string;
  material_description: string;
  material_tr: string;
  ean_upc: string;
  house: string;
  line: string;
  line_id: string;
  article_type: string;
  article_sub_type: string;
  division: string;
  icp_eur: string;
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
  shade: string;
  is_innovation_product: boolean;
  created_at: string;
  brand: Brand;
  brand_pillar: BrandPillar;
  category: Category;
  country: Country;
  market: Market;
  subcategory: Subcategory;
  segment: Segment;
  price_benchmark: unknown;
}

export interface GetOfferingProductsResponse {
  message: string;
  data: OfferingProduct[];
  meta: {
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
