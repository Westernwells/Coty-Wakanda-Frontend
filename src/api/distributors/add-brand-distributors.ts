import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface BrandProof {
  name: string;
  url: string;
}

export interface AddBrandDistributorInput {
  brands: Array<{
    category: string;
    brand_id: number;
    approved: boolean;
    proof: BrandProof[];
    type: string;
    pricing_id: number;
  }>;
}

export interface AddBrandDistributorResponse {
  message: string;
  data: unknown;
}

export function addBrandDistributors({
  distributorId,
  data,
}: {
  distributorId: number | string;
  data: AddBrandDistributorInput;
}): Promise<AddBrandDistributorResponse> {
  console.log("sending post request", data);
  return axios.post(`/distributors/${distributorId}/brands`, data);
}

interface UseAddBrandDistributorsOptions {
  mutationConfig?: MutationConfig<typeof addBrandDistributors>;
}

export function useAddBrandDistributors({
  mutationConfig,
}: UseAddBrandDistributorsOptions = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addBrandDistributors,
    onSuccess: (data, variables, context) => {
      // Invalidate the brands query for the distributor
      if (variables?.distributorId) {
        queryClient.invalidateQueries({
          queryKey: ["brands", variables.distributorId],
        });
      }
      mutationConfig?.onSuccess?.(data, variables, context);
    },
    ...mutationConfig,
  });
}
