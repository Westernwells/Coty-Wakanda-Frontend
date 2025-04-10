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
): Promise<ApiResponse> => {
    const response = await axios.get(`/forecasts/chart`, { params });
    return response.data;
};
