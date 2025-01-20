import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { Product } from "@/types";
import { useMutation } from "@tanstack/react-query";


export const updateProduct = ({
  data,
}: {
  data: Partial<Product>;
}): Promise<Comment> => {
  return axios.put(
    `/products/${data.id}`,
    data
  );
};

type UseUpdateProductOptions = {
  mutationConfig?: MutationConfig<typeof updateProduct>;
};

export const useUpdateProduct = ({
  mutationConfig,
}: UseUpdateProductOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateProduct,
  });
};
