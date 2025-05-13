import { axios } from "@/lib/axios";
import type { PricingList } from "@/types";

interface GetPricingListByIdResponse {
  message: string;
  data: PricingList; // Expect a single PricingList object
}

export async function getPricingListById(id: number): Promise<PricingList> {
  // Return PricingList directly as per typical single-item fetch patterns
  const response = await axios.get<GetPricingListByIdResponse>(
    `/pricing-lists/${id}`
  );
  return response.data.data; // Assuming the actual PricingList is nested under response.data.data
  // Adjust if the API returns it directly under response.data
}
