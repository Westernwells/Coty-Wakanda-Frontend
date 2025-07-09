import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { InnovationInput, ForecastSubmitInput } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type UpdateInnovationDTO = Omit<InnovationInput, "offerings"> & {
  forecast?: ForecastSubmitInput[];
};

export const updateForecastInnovation = ({
  data,
  innovationId,
  type = "save"
}: {
  data: UpdateInnovationDTO;
  innovationId: number;
  type?: "save" | "submit";
}): Promise<void> => {
  return axios.put(`/innovation-forecasts/${innovationId}?type=${type}`, data);
};

type UseUpdateForecastInnovationOptions = {
  mutationConfig?: MutationConfig<typeof updateForecastInnovation>;
};

export const useUpdateForecastInnovation = ({
  mutationConfig,
}: UseUpdateForecastInnovationOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...mutationConfig,
    mutationFn: updateForecastInnovation,
    onSuccess: (data, variables, context) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["forecast-innovations"],
        type: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["forecast-innovations", variables.innovationId.toString()],
        type: "all",
      });
      mutationConfig?.onSuccess?.(data, variables, context);
    },
  });
};
