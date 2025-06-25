import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { useMutation } from "@tanstack/react-query";

export const deleteLine = (id: number): Promise<void> => {
  return axios.delete(`/lines/${id}`);
};

type UseDeleteLineOptions = {
  mutationConfig?: MutationConfig<typeof deleteLine>;
};

export const useDeleteLine = ({ mutationConfig }: UseDeleteLineOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    ...restConfig,
    mutationFn: deleteLine,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ["lines"],
        type: "all",
      });
      if(onSuccess) {
        onSuccess(...args);
      }
    },
  });
};
