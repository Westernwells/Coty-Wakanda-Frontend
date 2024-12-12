import { axios } from "@/lib/axios";


export type Currency = {
    id: number;
    name: string;
    full_name: string;
    code: string;
    symbol: string;
    created_at: string;
    updated_at: string;
}

export type ApiResponse = {
    message: string;
    data: Currency[];
}

export const getCurrencies = async (): Promise<ApiResponse> => {
    const response = await axios.get("/currencies");
    return response.data;
}