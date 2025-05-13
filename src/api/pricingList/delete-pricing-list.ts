import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/lib/axios";

interface DeletePricingListResponse {
  message: string;
  data: null;
}

export function useDeletePricingList({
  mutationConfig = {},
}: {
  mutationConfig?: Record<string, unknown>;
} = {}) {
  const queryClient = useQueryClient();

  return useMutation<DeletePricingListResponse, Error, number>({
    mutationFn: async (id: number) => {
      const response = await axios.delete<DeletePricingListResponse>(
        `/pricing-lists/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-list"] });
    },
    ...mutationConfig,
  });
}
