import { axios } from "@/lib/axios";


export type Market = {
    id: number;
    region_id: number;
    name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
    active: boolean;
}

export type ApiResponse = {
    message: string;
    data: Market[];
}

export const getMarkets = async (): Promise<ApiResponse> => {
    const response = await axios.get("/markets");
    return response.data;
}