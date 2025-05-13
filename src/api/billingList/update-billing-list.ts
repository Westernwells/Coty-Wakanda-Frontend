import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/lib/axios";

interface UpdateBillingListData {
  id: number;
  name: string;
  type: string;
  description: string | null;
  products: Array<{ product_id: string; price: number }>;
}

interface UpdateBillingListRequest {
  data: UpdateBillingListData;
}

interface UpdateBillingListResponse {
  message: string;
  data: {
    id: number;
    name: string;
    type: string;
    description: string | null;
    created_at: string;
    products: Array<{ product_id: string; price: number }>;
  };
}

export function useUpdateBillingList({
  mutationConfig = {},
}: {
  mutationConfig?: Record<string, unknown>;
} = {}) {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateBillingListResponse,
    Error,
    UpdateBillingListRequest
  >({
    mutationFn: async ({ data }) => {
      const { id, ...updateData } = data;
      const response = await axios.put<UpdateBillingListResponse>(
        `/billing-lists/${id}`,
        updateData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-lists"] });
    },
    ...mutationConfig,
  });
}
