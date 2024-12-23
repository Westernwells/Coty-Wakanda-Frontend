import { axios } from "@/lib/axios";
import { User } from "./post-login";

type ApiResponse = {
    message: string;
    data: User;
}

export const getUser = async (): Promise<ApiResponse> => {
    const response = await axios.get("/user");
    return response.data;
}