import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const deleteOfferingProduct = ({
  innovationId,
  offeringId,
  productId,
}: {
  innovationId: number | string;
  offeringId: number | string;
  productId: number | string;
}): Promise<void> => {
  return axios.delete(
    `/innovations/${innovationId}/offerings/${offeringId}/products/${productId}`
  );
};

type UseDeleteOfferingProductOptions = {
  mutationConfig?: MutationConfig<typeof deleteOfferingProduct>;
};

export const useDeleteOfferingProduct = ({
  mutationConfig,
}: UseDeleteOfferingProductOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...mutationConfig,
    mutationFn: deleteOfferingProduct,
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
