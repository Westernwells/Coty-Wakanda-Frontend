import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateOfferingProductDTO } from "./create-product";

export const updateOfferingProduct = ({
  innovationId,
  offeringId,
  id,
  data,
}: {
  innovationId: number | string;
  offeringId: number | string;
  id: number;
  data: CreateOfferingProductDTO;
}): Promise<{ data: { id: number } }> => {
  console.log(
    `/innovations/${innovationId}/offerings/${offeringId}/products/${id}`
  );
  console.log("updating product-------", data);
  return axios.put(
    `/innovations/${innovationId}/offerings/${offeringId}/products/${id}`,
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
