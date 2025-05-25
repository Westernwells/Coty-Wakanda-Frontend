import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateOfferingProductDTO } from "./create-product";

export const updateOfferingProduct = ({
  innovationId,
  offeringId,
  productId,
  data,
}: {
  innovationId: number | string;
  offeringId: number | string;
  productId: number | string;
  data: CreateOfferingProductDTO;
}): Promise<{ data: { id: number } }> => {
  return axios.put(
    `/innovations/${innovationId}/offerings/${offeringId}/products/${productId}`,
    data
  );
};

type UseUpdateOfferingProductOptions = {
  mutationConfig?: MutationConfig<typeof updateOfferingProduct>;
};

export const useUpdateOfferingProduct = ({
  mutationConfig,
}: UseUpdateOfferingProductOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...mutationConfig,
    mutationFn: updateOfferingProduct,
    onSuccess: (data, variables, context) => {
      // Invalidate both innovation and offering queries
      queryClient.invalidateQueries({
        queryKey: ["innovations", variables.innovationId.toString()],
        type: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["offerings", variables.offeringId.toString()],
        type: "all",
      });
      mutationConfig?.onSuccess?.(data, variables, context);
    },
  });
};
