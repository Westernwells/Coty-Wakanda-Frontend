import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

export const bindProductInputSchema = z.object({
  icp_eur: z.number({ coerce: true }).min(1, "Required"),
  icp_usd: z.number({ coerce: true }).min(1, "Required"),
  french_usd: z.number({ coerce: true }).min(1, "Required"),
  french_eur: z.number({ coerce: true }).min(1, "Required"),
  rrsp: z.number({ coerce: true }).min(1, "Required"),
  regional_billing_price: z.number({ coerce: true }).min(1, "Required"),
});

export type bindProductInput = z.infer<typeof bindProductInputSchema>;

export const updateProductBinding = ({
  data,
  distributorId,
  productId,
}: {
  data: bindProductInput;
  distributorId: number;
  productId: number | string;
}): Promise<Comment> => {
  return axios.post(
    `/distributors/${distributorId}/products/${productId}`,
    data
  );
};

type UseUpadteProductBindingOptions = {
  mutationConfig?: MutationConfig<typeof updateProductBinding>;
};

export const useUpdateProductBinding = ({
  mutationConfig,
}: UseUpadteProductBindingOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ["product-bindings"],
        refetchType: "all",
        exact: false,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateProductBinding,
  });
};
