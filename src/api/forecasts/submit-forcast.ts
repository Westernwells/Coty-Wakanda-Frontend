import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { ForecastSubmitInput } from "@/types";
import { useMutation } from "@tanstack/react-query";


export const submitForecast = ({
  data,
  type
}: {
  data: {forecast: ForecastSubmitInput[]};
  type: "submit" | "save"
}): Promise<Comment> => {
  return axios.post(
    `/forecasts/${type}`,
    data
  );
};

type useSubmitForecastOptions = {
  mutationConfig?: MutationConfig<typeof submitForecast>;
};

export const useSubmitForecast = ({
  mutationConfig,
}: useSubmitForecastOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["base-forecasts"] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: submitForecast,
  });
};
