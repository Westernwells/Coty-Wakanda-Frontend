import { InnovationForecastsApiResponse } from '@/types/innovation-forecasts';

import { axios } from '@/lib/axios';

// export type ApiResponse = {
//   message: string;
//   data: any;
// };

export const getInnovationForecastsDetails = async (): Promise<InnovationForecastsApiResponse> => {
  const response = await axios.get<InnovationForecastsApiResponse>(`/innovation-forecasts/data`);
  //const response = await axios.get(`/forecasts/${product_id}/details`);
  // const response = await axios.get(
  //   `/innovation-forecasts/${2580}/details`
  // );
  return response.data;
};
