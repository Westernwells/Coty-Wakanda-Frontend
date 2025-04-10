import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { Royalty } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const updateRoyalty = ({
  data,
}: {
  data: Pick<Royalty, "value" | "freight" | "id"> & { brand_id: string };
}): Promise<Comment> => {
  return axios.put(`/royalties/${data.id}`, data);
};

type useUpdateRoyaltyOptions = {
  mutationConfig?: MutationConfig<typeof updateRoyalty>;
};

export const useUpdateRoyalty = ({
  mutationConfig,
}: useUpdateRoyaltyOptions) => {
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
    mutationFn: updateRoyalty,
  });
};
