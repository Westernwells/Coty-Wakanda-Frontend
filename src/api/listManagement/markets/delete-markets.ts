import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { useMutation } from "@tanstack/react-query";

export const deleteMarket = (id: number): Promise<Comment> => {
  return axios.delete(`/markets/${id}`);
};

type useDeleteMarketOptions = {
  mutationConfig?: MutationConfig<typeof deleteMarket>;
};

export const useDeleteMarket = ({ mutationConfig }: useDeleteMarketOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ["markets"],
        refetchType: "all",
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteMarket,
  });
};
