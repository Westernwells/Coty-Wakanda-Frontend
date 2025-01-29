import { ProductDistributor } from "@/types";

import { axios } from "@/lib/axios";

export type ApiResponse = {
    message: string;
    data: ProductDistributor[];
}

export const getProductDistributors = async (brand_id: string, pref: string): Promise<ApiResponse> => {
    const response = await axios.get(`/product-distributors?filter[brand_id]=${brand_id}&filter[pref]=${pref}`);
    return response.data;
}