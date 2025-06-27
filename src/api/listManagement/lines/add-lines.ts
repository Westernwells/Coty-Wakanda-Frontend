import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { Line } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const addLine = ({
  data,
}: {
  data: {
    name: string;
    house_id: string;
  }
}): Promise<Comment> => {
  return axios.post(`/lines`, data);
};

type UseAddLineOptions = {
  mutationConfig?: MutationConfig<typeof addLine>;
};

export const useAddLine = ({ mutationConfig }: UseAddLineOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    ...restConfig,
    mutationFn: addLine,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ["lines"],
        type: "all",
      });
      if (onSuccess) {
        onSuccess(...args);
      }
    },
  });
};
