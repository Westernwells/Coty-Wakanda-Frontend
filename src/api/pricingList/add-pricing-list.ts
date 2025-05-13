import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/lib/axios";

interface AddPricingListData {
  name: string;
  type: string;
  description: string | null;
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
    products: [];
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
        "/pricing-list",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-list"] });
    },
    ...mutationConfig,
  });
}
