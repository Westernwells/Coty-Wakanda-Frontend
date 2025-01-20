import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { Product } from "@/types";
import { useMutation } from "@tanstack/react-query";


export const addProduct = ({
  data,
}: {
  data: Partial<Product>;
}): Promise<Comment> => {
  return axios.post(
    `/products`,
    data
  );
};

type UseAddProductOptions = {
  mutationConfig?: MutationConfig<typeof addProduct>;
};

export const useAddProduct = ({
  mutationConfig,
}: UseAddProductOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: addProduct,
  });
};
