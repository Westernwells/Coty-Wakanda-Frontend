import { axios } from "@/lib/axios";
import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";

interface DeleteCoefficientResponse {
  message: string;
}

export const deleteCoefficient = async ({
  distributorId,
  coefficientId,
}: {
  distributorId: number;
  coefficientId: number;
}) => {
  const response = await axios.delete<DeleteCoefficientResponse>(
    `/distributors/${distributorId}/coefficients/${coefficientId}`
  );
  return response.data;
};

interface UseDeleteCoefficientOptions {
  mutationConfig?: UseMutationOptions<
    DeleteCoefficientResponse,
    Error,
    { distributorId: number; coefficientId: number },
    unknown
  >;
}

export function useDeleteCoefficient({
  mutationConfig,
}: UseDeleteCoefficientOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation<
    DeleteCoefficientResponse,
    Error,
    { distributorId: number; coefficientId: number }
  >({
    mutationFn: deleteCoefficient,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["coefficients", variables.distributorId],
      });
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    ...restConfig,
  });
}
