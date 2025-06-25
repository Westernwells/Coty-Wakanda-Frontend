import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { Lines } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const addLine = ({
  data,
}: {
  data: Pick<Lines, "name" | "house_id">;
}): Promise<Comment> => {
  return axios.post(`/lines`, data);
};

type UseAddLineOptions = {
  mutationConfig?: MutationConfig<typeof addLine>;
};

export const useAddLine = ({ mutationConfig }: UseAddLineOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ["lines"],
        refetchType: "all",
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: addLine,
  });
};
