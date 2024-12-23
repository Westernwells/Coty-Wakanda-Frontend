import { axios } from "@/lib/axios";


export type Country = {
    id: number;
    name: string;
    official_name: string;
    iso2: string;
    iso3: string;
    flag_url: string;
    created_at: string;
}

export type ApiResponse = {
    message: string;
    data: Country[];
}

export const getCountries = async (): Promise<ApiResponse> => {
    const response = await axios.get("/countries");
    return response.data;
}