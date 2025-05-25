import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PriceBenchmark } from "@/types";

export interface CreateOfferingProductDTO {
  id?: number;
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
  division?: string;
  brand_category?: string;
  ean_upc?: string;
  house?: string;
  line?: string;
  line_id?: string | number;
  article_type?: string;
  offering_number?: string | number;
  launch_date?: string;
  discontinue_date?: string;
  category_id?: string;
  subcategory_id?: string;
  market_id?: string;
  segment_id?: string;
  factory?: string | number;
  commodity_id?: string;
  country_id?: string;
  gender?: string;
  size?: string;
  length?: string | number;
  height?: string | number;
  width?: string | number;
  volume?: string | number;
  gross_weight?: string | number;
  net_weight?: string | number;
  units?: string | number;
  icp_eur?: string | number;
  icp_usd?: string | number;
  price_benchmark?: PriceBenchmark | null;
  __gemini_diag_field?: string; // Temporary diagnostic field
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
