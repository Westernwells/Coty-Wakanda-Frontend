import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { Royalty } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const addRoyalty = ({
  data,
}: {
  data: Pick<Royalty, "value" | "freight"> & { brand_id: string };
}): Promise<Comment> => {
  return axios.post(`/royalties`, data);
};

type useAddRoyaltyOptions = {
  mutationConfig?: MutationConfig<typeof addRoyalty>;
};

export const useAddRoyalty = ({ mutationConfig }: useAddRoyaltyOptions) => {
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
    mutationFn: addRoyalty,
  });
};
