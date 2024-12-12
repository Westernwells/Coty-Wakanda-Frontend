import { axios } from "@/lib/axios";


export type Brand = {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
    brand_type_id: number;
    active: boolean;
}

export type ApiResponse = {
    message: string;
    data: Brand[];
}

export const getBrands = async (): Promise<ApiResponse> => {
    const response = await axios.get("/brands");
    return response.data;
}