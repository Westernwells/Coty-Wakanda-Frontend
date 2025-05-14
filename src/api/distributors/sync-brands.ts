import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/lib/axios";

interface SyncBrandsData {
  brands: Array<{
    id: number;
    approved: boolean;
    proofs: string[];
    coefficient_type: string;
    billing_type: string;
  }>;
}

interface SyncBrandsRequest {
  distributorId: number;
  data: SyncBrandsData;
}

interface SyncBrandsResponse {
  message: string;
  data: {
    id: number;
    brands: Array<{
      id: number;
      name: string;
      approved: boolean;
      proofs: string[];
      coefficient_type: string;
      billing_type: string;
      created_at: string;
    }>;
  };
}

export function useSyncBrands({
  mutationConfig = {},
}: {
  mutationConfig?: Record<string, unknown>;
} = {}) {
  const queryClient = useQueryClient();

  return useMutation<SyncBrandsResponse, Error, SyncBrandsRequest>({
    mutationFn: async ({ distributorId, data }) => {
      const response = await axios.post<SyncBrandsResponse>(
        `/distributors/${distributorId}/brands`,
        data
      );
      return response.data;
    },
    onSuccess: (_, { distributorId }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["distributors"] });
      queryClient.invalidateQueries({
        queryKey: ["distributor", distributorId.toString()],
      });
    },
    ...mutationConfig,
  });
}
