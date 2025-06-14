import { ForecastChartData, ForecastFilters } from "@/types";

import { axios } from "@/lib/axios";

type GetForecastsChartParams = {
    filter?: ForecastFilters;
};
export type ApiResponse = {
    message: string;
    data: { chart: ForecastChartData };
};

export const getForecastChart = async (
    params?: GetForecastsChartParams
  ): Promise<any> => {
    const formattedParams: Record<string, any> = {
      ...(params?.filter?.search?.trim() && { search: params.filter.search.trim() }),
      ...(params?.filter?.start_date && { ['filter[start_date]']: params.filter.start_date }),
      ...(params?.filter?.end_date && { ['filter[end_date]']: params.filter.end_date }),
      ...(params?.filter?.brand_id && { ['filter[brand_id]']: params.filter.brand_id }),
      ...(params?.filter?.sub_brand_id && { ['filter[sub_brand_id]']: params.filter.sub_brand_id }),
      ...(params?.filter?.distributor_id && { ['filter[distributor_id]']: params.filter.distributor_id }),
      ...(params?.filter?.launch_id && { ['filter[launch_id]']: params.filter.launch_id }),
      ...(params?.filter?.type && { ['filter[type]']: params.filter.type }),
      ...(params?.filter?.sort && { sort: params.filter.sort }),
      ...(params?.filter?.brand_type && params.filter.brand_type !== 'all' && { ['filter[brand_type]']: params.filter.brand_type }),
    };
  
    const response = await axios.get(`/forecasts/chart`, { params: formattedParams });
    return response.data;
  };
  

  export const getInnovationForecastChart = async (
    params?: GetForecastsChartParams
  ): Promise<any> => {
    const formattedParams: Record<string, any> = {
      ...(params?.filter?.search?.trim() && { search: params.filter.search.trim() }),
      ...(params?.filter?.start_date && { ['filter[start_date]']: params.filter.start_date }),
      ...(params?.filter?.end_date && { ['filter[end_date]']: params.filter.end_date }),
      ...(params?.filter?.brand_id && { ['filter[brand_id]']: params.filter.brand_id }),
      ...(params?.filter?.sub_brand_id && { ['filter[sub_brand_id]']: params.filter.sub_brand_id }),
      ...(params?.filter?.distributor_id && { ['filter[distributor_id]']: params.filter.distributor_id }),
      ...(params?.filter?.launch_id && { ['filter[launch_id]']: params.filter.launch_id }),
      ...(params?.filter?.type && { ['filter[type]']: params.filter.type }),
      ...(params?.filter?.sort && { sort: params.filter.sort }),
      ...(params?.filter?.brand_type && params.filter.brand_type !== 'all' && { ['filter[brand_type]']: params.filter.brand_type }),
    };
  
    const response = await axios.get(`/innovation-forecasts/chart`, {
      params: formattedParams,
    });
    return response.data;
  };