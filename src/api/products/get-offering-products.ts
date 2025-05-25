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
  house: string | null;
  description: string | null;
  brand: string | null;
  brand_line: string | null;
  article_type: string | null;
  irc: string;
  icp_eur: number | null;
  icp_usd: number | null;
  group: string | null;
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
