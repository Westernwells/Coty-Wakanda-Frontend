import { axios } from "@/lib/axios";

interface BillingList {
  id: number;
  name: string;
  type: string;
  description: string | null;
  created_at: string;
}

interface GetBillingListParams {
  cursor?: number;
  page_size?: number;
}

interface GetBillingListResponse {
  data: BillingList[];
  total_count: number;
}

export async function getBillingList({
  cursor,
  page_size = 10,
}: GetBillingListParams): Promise<GetBillingListResponse> {
  const response = await axios.get<GetBillingListResponse>("/billing-lists", {
    params: {
      cursor,
      page_size,
    },
  });
  return response.data;
}
