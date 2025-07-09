import { axios } from "@/lib/axios";

export type ApiResponse = {
    message: string;
    data: {
        id: string;
        name: string;
    }[];
};

export const getHouses = async (): Promise<ApiResponse> => {
    const response = await axios.get("/houses");
    return response.data;
};
