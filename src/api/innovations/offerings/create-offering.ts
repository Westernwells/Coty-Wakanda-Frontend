import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface CreateOfferingDTO {
  number: string;
  icw: string;
  ocd: string;
  type: string;
  deck?: string;
  market_deck?: string;
}

export const createOffering = ({
  innovationId,
  data,
}: {
  innovationId: number | string;
  data: CreateOfferingDTO;
}): Promise<any> => {
  return axios.post(`/innovations/${innovationId}/offerings`, data);
};

type UseCreateOfferingOptions = {
  mutationConfig?: MutationConfig<typeof createOffering>;
};

export const useCreateOffering = ({
  mutationConfig,
}: UseCreateOfferingOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...mutationConfig,
    mutationFn: createOffering,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["innovations", variables.innovationId.toString()],
        type: "all",
      });
      mutationConfig?.onSuccess?.(data, variables, context);
    },
  });
};
