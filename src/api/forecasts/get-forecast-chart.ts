import { ForecastChartData } from "@/types";

import { axios } from "@/lib/axios";

export type ApiResponse = {
    message: string;
    data: {chart: ForecastChartData;}
}

export const getForecastChart = async (): Promise<ApiResponse> => {
    const response = await axios.get(`/forecasts/chart`);
    return response.data;
}