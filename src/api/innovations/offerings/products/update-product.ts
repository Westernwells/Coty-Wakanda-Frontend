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
  return axios
    .put(
      `/innovations/${innovationId}/offerings/${offeringId}/products/${id}`,
      data
    )
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(
          "Update Product API Error - Status:",
          error.response.status
        );
        console.error("Update Product API Error - Data:", error.response.data);
        console.error(
          "Update Product API Error - Headers:",
          error.response.headers
        );
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Update Product API Error - No response:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Update Product API Error - Message:", error.message);
      }
      console.error("Update Product API Error - Config:", error.config);
      throw error; // Re-throw the error to be caught by react-query
    });
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
