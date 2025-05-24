import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { InnovationInput } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const addInnovation = ({
  data,
}: {
  data: InnovationInput;
}): Promise<Comment> => {
  console.log("Sending data to add innovation", data);
  return axios.post(`/innovations`, data);
};

type useAddInnovationOptions = {
  mutationConfig?: MutationConfig<typeof addInnovation>;
};

export const useAddInnovation = ({
  mutationConfig,
}: useAddInnovationOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ["innovations"],
        refetchType: "all",
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: addInnovation,
  });
};
