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

export interface Product {
  id: number;
  product_type: string;
  offering_number: string | null;
  sku: string;
  irc: string;
  material_description: string;
  material_tr: string | null;
  article_type: string;
  article_sub_type: string;
  division: string | null;
  icp_eur: string;
  icp_usd: string;
  cssp_trex_eur: string | null;
  cssp_trex_usd: string | null;
  created_at: string;
  brand: Brand;
  brand_pillar: BrandPillar;
  category: Category;
  price: string;
}

export interface Meta {
  cursor: number | null; // Assuming cursor can be null if there's no next/prev page
  page_size: number;
  has_previous: boolean;
  has_next: boolean;
  total: number;
}

export interface GetBillingProductListParams {
  billing_list_id?: number;
  cursor?: number;
  page_size?: number;
  brand_ids?: number[];
  sub_brand_ids?: number[];
}

export interface GetBillingProductListResponse {
  message: string; // Added based on the JSON root
  data: Product[];
  meta: Meta;
}

export async function getBillingProductList({
  billing_list_id,
  cursor,
  page_size = 10,
  brand_ids,
  sub_brand_ids,
}: GetBillingProductListParams): Promise<GetBillingProductListResponse> {
  const apiParams: Record<string, string | number | undefined> = {
    cursor,
    page_size,
    "filter[brand_id]": brand_ids?.join(","),
    "filter[sub_brand_id]": sub_brand_ids?.join(","),
  };

  if (brand_ids && brand_ids.length > 0) {
    apiParams["filter[brand_id]"] = brand_ids.join(",");
  }
  if (sub_brand_ids && sub_brand_ids.length > 0) {
    apiParams["filter[sub_brand_id]"] = sub_brand_ids.join(",");
  }

  const endpoint = billing_list_id
    ? `/billing-list-products/${billing_list_id}`
    : "/products";

  const response = await axios.get<GetBillingProductListResponse>(endpoint, {
    params: apiParams,
  });
  return response.data;
}
