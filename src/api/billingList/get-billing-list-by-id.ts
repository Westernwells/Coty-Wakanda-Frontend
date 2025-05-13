import { axios } from "@/lib/axios";
import type { BillingList } from "@/types";

interface GetBillingListByIdResponse {
  message: string;
  data: BillingList; // Expect a single BillingList object
}

export async function getBillingListById(id: number): Promise<BillingList> {
  // Return Bill directly as per typical single-item fetch patterns
  const response = await axios.get<GetBillingListByIdResponse>(
    `/billing-lists/${id}`
  );
  return response.data.data; // Assuming the actual BillingList is nested under response.data.data
  // Adjust if the API returns it directly under response.data
}
