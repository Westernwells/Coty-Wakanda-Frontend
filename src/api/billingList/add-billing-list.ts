import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/lib/axios";

interface AddBillingListData {
  name: string;
  type: string;
  description: string;
  file?: unknown;
  products?: Array<{ product_id: number; price: number }>;
}

interface AddBillingListRequest {
  data: AddBillingListData;
}

interface AddBillingListResponse {
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

export function useAddBillingList({
  mutationConfig = {},
}: {
  mutationConfig?: Record<string, unknown>;
} = {}) {
  const queryClient = useQueryClient();

  return useMutation<AddBillingListResponse, Error, AddBillingListRequest>({
    mutationFn: async ({ data }) => {
      console.log({ "sending data": data });
      const response = await axios.post<AddBillingListResponse>(
        "/billing-lists",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["billing-lists"],
        refetchType: "all",
      });
    },
    ...mutationConfig,
  });
}
