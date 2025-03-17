import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { Market } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const addMarket = ({
  data,
}: {
  data: Pick<Market, "name">;
}): Promise<Comment> => {
  return axios.post(`/markets`, data);
};

type useAddMarketOptions = {
  mutationConfig?: MutationConfig<typeof addMarket>;
};

export const useAddMarket = ({ mutationConfig }: useAddMarketOptions) => {
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
    mutationFn: addMarket,
  });
};
