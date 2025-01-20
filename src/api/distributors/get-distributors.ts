import { axios } from "@/lib/axios";
import { Distributor, Meta } from "@/types";


type GetDistributorsParams = {
    page?: number;
    per_page?: number;
}

export type ApiResponse = {
    message: string;
    data: Distributor[];
    meta: Meta;
}

export const getDistributors = async (params?: GetDistributorsParams): Promise<ApiResponse> => {
    const response = await axios.get("/distributors", { params });
    return response.data;
}