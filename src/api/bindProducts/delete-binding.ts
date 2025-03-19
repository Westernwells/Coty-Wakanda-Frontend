import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { useMutation } from "@tanstack/react-query";

export const deleteProductBinding = ({
  distributorId,
  productId,
}: {
  distributorId: number;
  productId: number;
}): Promise<Comment> => {
  return axios.delete(`/distributors/${distributorId}/products/${productId}`);
};

type UseDeleteProductBindingOptions = {
  mutationConfig?: MutationConfig<typeof deleteProductBinding>;
};

export const useDeleteProductBinding = ({
  mutationConfig,
}: UseDeleteProductBindingOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["product-bindings"] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteProductBinding,
  });
};
