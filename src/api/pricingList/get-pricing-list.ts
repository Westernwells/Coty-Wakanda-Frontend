import { axios } from "@/lib/axios";
import type { PricingList } from "@/types";

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
