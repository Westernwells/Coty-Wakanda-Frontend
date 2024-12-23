import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { useMutation } from "@tanstack/react-query";

export const deleteCoefficient = ({
  distributorId,
  coeffId
}: {
  distributorId: number;
  coeffId: number; 
}): Promise<Comment> => {
  return axios.delete(`/distributors/${distributorId}/coefficients/${coeffId}`);
};

type UseDeleteCoefficientOptions = {
  mutationConfig?: MutationConfig<typeof deleteCoefficient>;
};

export const useDeleteCoefficient = ({
  mutationConfig,
}: UseDeleteCoefficientOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({queryKey: ['distributors']})
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteCoefficient,
  });
};
