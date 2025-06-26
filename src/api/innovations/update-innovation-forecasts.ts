import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { ForecastSubmitInput } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/main";

type ForecastData = {
  forecast: ForecastSubmitInput[];
};

export const updateInnovationForecasts = ({
  data,
  type,
}: {
  data: ForecastData;
  type: "submit" | "save";
}): Promise<void> => {
  return axios.post(`/innovation-forecasts/${type}`, data);
};

type UseUpdateInnovationForecastsOptions = {
  mutationConfig?: MutationConfig<typeof updateInnovationForecasts>;
};

export const useUpdateInnovationForecasts = ({
  mutationConfig,
}: UseUpdateInnovationForecastsOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ["innovations-forecasts"],
        refetchType: "all",
        exact: false,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateInnovationForecasts,
  });
};
