import { axios } from "@/lib/axios";


export type Region = {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
    active: boolean;
}

export type ApiResponse = {
    message: string;
    data: Region[];
}

export const getRegions = async (): Promise<ApiResponse> => {
    const response = await axios.get("/regions");
    return response.data;
}