import { ForecastDetailsData } from '@/types';

import { axios } from '@/lib/axios';

export type ApiResponse = {
  message: string;
  data: ForecastDetailsData;
};

export const getInnovationForecastsDetails = async (): Promise<ApiResponse> => {
  const response = await axios.get(`/innovation-forecasts/data`);
  //const response = await axios.get(`/forecasts/${product_id}/details`);
  // const response = await axios.get(
  //   `/innovation-forecasts/${2580}/details`
  // );
  return response.data;
};
