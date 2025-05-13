import { axios } from "@/lib/axios";
import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { toast } from "react-toastify";

interface DeleteBillingListResponse {
  message: string;
}

export const deleteBillingList = async (id: number) => {
  const response = await axios.delete<DeleteBillingListResponse>(
    `/billing-list/${id}`
  );
  return response.data;
};

interface UseDeleteBillingListOptions {
  mutationConfig?: UseMutationOptions<
    DeleteBillingListResponse,
    Error,
    number,
    unknown
  >;
}

export function useDeleteBillingList({
  mutationConfig,
}: UseDeleteBillingListOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation<DeleteBillingListResponse, Error, number>({
    mutationFn: deleteBillingList,
    onSuccess: (data, variables, context) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["billing-lists"] });
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    ...restConfig,
  });
}
