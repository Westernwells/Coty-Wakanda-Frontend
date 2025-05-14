import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { useMutation } from "@tanstack/react-query";

interface BulkStatusUpdateRequest {
  distributorId: number;
  products: number[];
  status: "hidden" | "visible";
}

export const updateProductsStatus = ({
  distributorId,
  products,
  status,
}: BulkStatusUpdateRequest): Promise<{ message: string }> => {
  return axios.post(
    `/distributors/${distributorId}/products/bulk-status-update`,
    {
      products,
      status,
    }
  );
};

type UseUpdateProductsStatusOptions = {
  config?: MutationConfig<typeof updateProductsStatus>;
};

export const useUpdateProductsStatus = ({
  config,
}: UseUpdateProductsStatusOptions = {}) => {
  const { onSuccess, ...restConfig } = config || {};

  return useMutation({
    onSuccess: (_, variables, ...rest) => {
      // Invalidate the specific product list query for this distributor
      queryClient.invalidateQueries({
        queryKey: ["products", { distributorId: variables.distributorId }],
        exact: false,
        refetchType: "active",
      });

      onSuccess?.(_, variables, ...rest);
    },
    ...restConfig,
    mutationFn: updateProductsStatus,
  });
};
