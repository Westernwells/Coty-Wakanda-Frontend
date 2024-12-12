import { axios } from "@/lib/axios";


export type Category = {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
    active: boolean;
}

export type ApiResponse = {
    message: string;
    data: Category[];
}

export const getCategories = async (): Promise<ApiResponse> => {
    const response = await axios.get("/categories");
    return response.data;
}