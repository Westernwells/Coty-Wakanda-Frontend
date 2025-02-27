import { axios } from "@/lib/axios";
import { Brand } from "@/types";


export type Pillar = {
    id: number;
    name: string;
    created_at: string;
    brand: Partial<Brand>
}

export type ApiResponse = {
    message: string;
    data: Pillar[];
}

export const getBrandPillars = async (params: object): Promise<ApiResponse> => {
    const response = await axios.get("/brand-pillars", {params: params});
    return response.data;
}