import { axios } from '@/lib/axios';
import { MutationConfig } from '@/lib/react-query';
import { queryClient } from '@/main';
import { ForecastSubmitInput } from '@/types';
import { useMutation } from '@tanstack/react-query';

export const saveForecast = ({
  data,
  type,
}: {
  data: { forecast: ForecastSubmitInput[] };
  type: 'submit' | 'save';
}): Promise<Comment> => {
  return axios.post(`/innovation-forecasts/${type}`, data);
};

type useSaveForecastOptions = {
  mutationConfig?: MutationConfig<typeof saveForecast>;
  forecastId: string;
};

export const useSaveForecast = ({
  mutationConfig,
  forecastId,
}: useSaveForecastOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['forecast-details', forecastId] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: saveForecast,
  });
};
