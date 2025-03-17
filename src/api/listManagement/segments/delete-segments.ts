import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { useMutation } from "@tanstack/react-query";

export const deleteSegment = (id: number): Promise<Comment> => {
  return axios.delete(`/segments/${id}`);
};

type useDeleteSegmentOptions = {
  mutationConfig?: MutationConfig<typeof deleteSegment>;
};

export const useDeleteSegment = ({
  mutationConfig,
}: useDeleteSegmentOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ["segments"],
        refetchType: "all",
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteSegment,
  });
};
