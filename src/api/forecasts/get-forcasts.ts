import { ForecastData, ForecastFilters, Meta } from "@/types";

import { axios } from "@/lib/axios";

type GetForecastsParams = {
    cursor?: number;
    page_size?: number;
    include?: string;
    filter?: ForecastFilters;
};
export type ApiResponse = {
    message: string;
    data: { forecast: ForecastData[] };
    meta: Meta;
};

export const getForecasts = async (
    params?: GetForecastsParams
): Promise<ApiResponse> => {
    const formattedParams = {
        cursor: params?.cursor || 1,
        page_size: params?.page_size || 20,
        search: params?.filter?.search || "",
        "filter[brand_id]": params?.filter?.brand_id || "",
        "filter[sub_brand_id]": params?.filter?.sub_brand_id || "",
        "filter[distributor_id]": params?.filter?.distributor_id || "",
        "filter[brand_type]": params?.filter?.brand_type || "",
        "filter[launch_id]": params?.filter?.launch_id || "",
        "filter[start_date]": params?.filter?.start_date || "",
        "filter[end_date]": params?.filter?.end_date || "",
        "filter[type]": params?.filter?.type || "",
        sort: params?.filter?.sort || "",
    };
    const response = await axios.get(`/forecasts/data`, {
        params: formattedParams,
    });
    return response.data;
};
