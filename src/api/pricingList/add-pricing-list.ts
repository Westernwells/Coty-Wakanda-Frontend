import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { axios } from "@/lib/axios";

interface AddPricingListData {
  name: string;
  type: string;
  description: string;
  file?: unknown;
  products?: Array<{ product_id: number; price: number }>;
}

interface AddPricingListRequest {
  data: AddPricingListData;
}

interface AddPricingListResponse {
  message: string;
  data: {
    id: number;
    name: string;
    type: string;
    description: string | null;
    created_at: string;
    products: Array<{
      product_id: string;
      price: string;
    }>;
  };
}

// Type for mutationConfig, excluding mutationFn as it's defined by the hook
type CustomMutationConfig = Omit<
  UseMutationOptions<AddPricingListResponse, Error, AddPricingListRequest>,
  "mutationFn"
>;

export function useAddPricingList({
  mutationConfig = {} as CustomMutationConfig, // Provide a default typed empty object
}: {
  mutationConfig?: CustomMutationConfig;
}) {
  const queryClient = useQueryClient();

  // Extract component's onSuccess from mutationConfig
  const { onSuccess: componentOnSuccessCallback, ...restMutationConfig } =
    mutationConfig;

  return useMutation<AddPricingListResponse, Error, AddPricingListRequest>({
    mutationFn: async ({ data }) => {
      const response = await axios.post<AddPricingListResponse>(
        "/pricing-lists",
        data
      );
      console.log("incoming data", data);
      console.log("response", response.data);
      return response.data;
    },
    onSuccess: (responseData, variables, context) => {
      // Invalidate all relevant pricing list queries
      queryClient.invalidateQueries({ queryKey: ["pricing-lists"] });
      queryClient.invalidateQueries({ queryKey: ["pricingProductList"] });

      // Then, if component provided an onSuccess, call it
      if (componentOnSuccessCallback) {
        componentOnSuccessCallback(responseData, variables, context);
      }
    },
    // Spread the rest of the config (e.g., onError, onSettled from component)
    ...restMutationConfig,
  });
}
