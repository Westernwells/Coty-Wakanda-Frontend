import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface CreateOfferingProductDTO {
  irc: string;
  material_description?: string;
  icp_cost: number;
  price: number;
  currency: "EUR" | "USD";
  brand_id: string;
  sub_brand_id?: string;
  product_type: "saleable" | "non-saleable";
  pref: "pref" | "non-pref";
  grouping: "1" | "2" | "3";
}

interface CreateOfferingProductResponse {
  data: {
    id: number;
    irc: string;
    material_description?: string;
    icp_cost: number;
    price: number;
    currency: "EUR" | "USD";
    brand_id: string;
    sub_brand_id?: string;
    product_type: "saleable" | "non-saleable";
    pref: "pref" | "non-pref";
    grouping: "1" | "2" | "3";
  };
}

export const createOfferingProduct = ({
  innovationId,
  offeringId,
  data,
}: {
  innovationId: number | string;
  offeringId: number | string;
  data: CreateOfferingProductDTO;
}): Promise<CreateOfferingProductResponse> => {
  console.log("sent to api data", data);
  return axios.post(
    `/innovations/${innovationId}/offerings/${offeringId}/products`,
    data
  );
};

type UseCreateOfferingProductOptions = {
  mutationConfig?: MutationConfig<typeof createOfferingProduct>;
};

export const useCreateOfferingProduct = ({
  mutationConfig,
}: UseCreateOfferingProductOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...mutationConfig,
    mutationFn: createOfferingProduct,
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
