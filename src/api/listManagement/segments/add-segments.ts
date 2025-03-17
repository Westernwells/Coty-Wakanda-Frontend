import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { Segment } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const addSegment = ({
  data,
}: {
  data: Pick<Segment, "name">;
}): Promise<Comment> => {
  return axios.post(`/segments`, data);
};

type useAddSegmentOptions = {
  mutationConfig?: MutationConfig<typeof addSegment>;
};

export const useAddSegment = ({ mutationConfig }: useAddSegmentOptions) => {
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
    mutationFn: addSegment,
  });
};
