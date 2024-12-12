import { Distributor, } from "@/types";
import { axios } from "@/lib/axios";

export type ApiResponse = {
    message: string;
    data: Distributor;
}

export const getDistributor = async (id: string): Promise<ApiResponse> => {
    const response = await axios.get(`/distributors/${id}`);
    return response.data;
}