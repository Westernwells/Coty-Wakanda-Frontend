import { ForecastData } from "@/types";

import { axios } from "@/lib/axios";

export type ApiResponse = {
    message: string;
    data: {forecast: ForecastData[];}
}

export const getForecasts = async (): Promise<ApiResponse> => {
    const response = await axios.get(`/forecasts/data`);
    return response.data;
}