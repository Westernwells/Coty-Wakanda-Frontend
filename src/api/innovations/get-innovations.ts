import { Innovation } from "@/types";

import { axios } from "@/lib/axios";

export type ApiResponse = {
    message: string;
    data:  Innovation[];
}

export const getInnovations = async (): Promise<ApiResponse> => {
    const response = await axios.get(`/innovations`, {params: {per_page: 9999999, page: 1}});
    return response.data;
}