import { Product } from "@/types";

import { axios } from "@/lib/axios";

export type ApiResponse = {
    message: string;
    data: Product;
}

export const getProduct = async (id: string): Promise<ApiResponse> => {
    const response = await axios.get(`/products/${id}`);
    return response.data;
}