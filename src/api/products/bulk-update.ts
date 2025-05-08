import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { Product } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const bulkUpdateProduct = ({
  data,
}: {
  data: { products: Partial<Product>[] };
}): Promise<Comment> => {
  return axios.post(`/product-bulk-update`, data);
};

type UseBulkUpdateProductOptions = {
  mutationConfig?: MutationConfig<typeof bulkUpdateProduct>;
};

export const useBulkUpdateProduct = ({
  mutationConfig,
}: UseBulkUpdateProductOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: bulkUpdateProduct,
  });
};
