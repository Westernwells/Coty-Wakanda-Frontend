import { ForecastDetailsData } from '@/types';

import { axios } from '@/lib/axios';

export type ApiResponse = {
  message: string;
  data: ForecastDetailsData;
};

export const getForecastDetails = async (
  product_id: string
): Promise<ApiResponse> => {
  //const response = await axios.get(`/innovation-forecasts/data`);
  const response = await axios.get(`/forecasts/${product_id}/details`);
  return response.data;
};
