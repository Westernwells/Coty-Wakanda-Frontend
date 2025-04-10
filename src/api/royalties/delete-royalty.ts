import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { useMutation } from "@tanstack/react-query";

export const deleteRoyalty = (id: number): Promise<Comment> => {
  return axios.delete(`/royalties/${id}`);
};

type useDeleteRoyaltyOptions = {
  mutationConfig?: MutationConfig<typeof deleteRoyalty>;
};

export const useDeleteRoyalty = ({
  mutationConfig,
}: useDeleteRoyaltyOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ["royalties"],
        refetchType: "all",
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteRoyalty,
  });
};
