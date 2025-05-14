import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/lib/axios";

interface AddPricingListData {
  name: string;
  type: string;
  description: string;
  file?: unknown;
  products?: Array<{ product_id: number; price: number }>;
}

interface AddPricingListRequest {
  data: AddPricingListData;
}

interface AddPricingListResponse {
  message: string;
  data: {
    id: number;
    name: string;
    type: string;
    description: string | null;
    created_at: string;
    products: Array<{
      product_id: string;
      price: string;
    }>;
  };
}

export function useAddPricingList({
  mutationConfig = {},
}: {
  mutationConfig?: Record<string, unknown>;
} = {}) {
  const queryClient = useQueryClient();

  return useMutation<AddPricingListResponse, Error, AddPricingListRequest>({
    mutationFn: async ({ data }) => {
      const response = await axios.post<AddPricingListResponse>(
        "/pricing-lists",
        data
      );
      console.log("incoming data", data);
      console.log("response", response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-lists"] });
    },
    ...mutationConfig,
  });
}
