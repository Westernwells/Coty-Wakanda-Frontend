import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { Segment } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const updateSegment = ({
  data,
}: {
  data: Pick<Segment, "name" | "id">;
}): Promise<Comment> => {
  return axios.put(`/segments/${data.id}`, data);
};

type useUpdateSegmentOptions = {
  mutationConfig?: MutationConfig<typeof updateSegment>;
};

export const useUpdateSegment = ({
  mutationConfig,
}: useUpdateSegmentOptions) => {
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
    mutationFn: updateSegment,
  });
};
