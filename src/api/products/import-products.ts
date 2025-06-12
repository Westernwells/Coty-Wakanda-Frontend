import { useMutation } from "@tanstack/react-query";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { axios } from "@/lib/axios";
export interface ImportProductsResponse {
  message: string;
  data: {
    id: number;
    number: string;
    icw: string;
    ocd: string;
    type: string;
    deck: string;
    market_deck: string;
  };
}
export const importProducts = (params: {
  innovationId: number;
  offeringId: number;
  file: File;
  type: "pim" | "trex";
}): Promise<ImportProductsResponse> => {
  const { innovationId, offeringId, file, type } = params;
  const formData = new FormData();
  formData.append("product_file", file, file.name);
  formData.append("type", type);

  return axios
    .post<ImportProductsResponse>(
      `innovations/${innovationId}/offerings/${offeringId}/import-products`,
      formData,
      {
        headers: {
          Accept: "application/json",
          // ← do NOT set Content-Type here, browser will add the right boundary
        },
      }
    )
    .then((res) => res.data);
};
export type UseImportProductsOptions = {
  mutationConfig?: MutationConfig<any>;
};

export const useImportProducts = ({
  mutationConfig,
}: UseImportProductsOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation<
    ImportProductsResponse,
    Error,
    { file: File; type: "pim" | "trex"; offeringId: number; innovationId: number }
  >({
    mutationFn: ({ file, type, offeringId, innovationId }) =>{
      return importProducts({ innovationId, offeringId, file, type })
    },

    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess?.(data, variables, context);
    },

    ...restConfig,
  });
};
