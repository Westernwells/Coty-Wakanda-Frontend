import { axios } from "@/lib/axios";

interface Product {
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
  brand: {
    id: number;
    name: string;
    type: string;
    created_at: string;
  };
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
  };
  category: {
    id: number;
    name: string;
    created_at: string;
  };
  base_price: string;
}

interface PricingList {
  id: number;
  name: string;
  type: string;
  description: string | null;
  created_at: string;
  products: Product[];
}

interface GetPricingListResponse {
  message: string;
  data: PricingList[];
}

interface GetPricingListParams {
  cursor?: number;
  page_size?: number;
}

export async function getPricingList({
  cursor = 1,
  page_size = 20,
}: GetPricingListParams = {}): Promise<GetPricingListResponse> {
  const response = await axios.get<GetPricingListResponse>(
    `/pricing-lists?cursor=${cursor}&page_size=${page_size}`
  );
  return response.data;
}
