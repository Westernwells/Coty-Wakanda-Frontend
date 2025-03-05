import { axios } from "@/lib/axios";
import { Distributor, Filters, Meta } from "@/types";

type GetDistributorsParams = {
    cursor?: number;
    page_size?: number;
    include?: string;
    filter?: Filters;
};
export type ApiResponse = {
    message: string;
    data: Distributor[];
    meta: Meta;
};

export const getDistributors = async (
    params?: GetDistributorsParams
): Promise<ApiResponse> => {
    const formattedParams = {
        cursor: params?.cursor || 1,
        page_size: params?.page_size || 20,
        search: params?.filter?.search || "",
        "filter[region_id]": params?.filter?.region_id || "",
        "filter[market_id]": params?.filter?.market_id || "",
    };
    const response = await axios.get("/distributors", {
        params: formattedParams,
    });
    return response.data;
};
