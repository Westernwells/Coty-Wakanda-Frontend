import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/lib/axios";

interface UpdatePricingListData {
  id: number;
  name: string;
  type: string;
  description: string | null;
}

interface UpdatePricingListRequest {
  data: UpdatePricingListData;
}

interface UpdatePricingListResponse {
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

export function useUpdatePricingList({
  mutationConfig = {},
}: {
  mutationConfig?: Record<string, unknown>;
} = {}) {
  const queryClient = useQueryClient();

  return useMutation<
    UpdatePricingListResponse,
    Error,
    UpdatePricingListRequest
  >({
    mutationFn: async ({ data }) => {
      const { id, ...updateData } = data;
      const response = await axios.put<UpdatePricingListResponse>(
        `/pricing-list/${id}`,
        updateData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-list"] });
    },
    ...mutationConfig,
  });
}
