import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { Market } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const updateMarket = ({
  data,
}: {
  data: Pick<Market, "name" | "id">;
}): Promise<Comment> => {
  return axios.put(`/markets/${data.id}`, data);
};

type useUpdateMarketOptions = {
  mutationConfig?: MutationConfig<typeof updateMarket>;
};

export const useUpdateMarket = ({ mutationConfig }: useUpdateMarketOptions) => {
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
    mutationFn: updateMarket,
  });
};
