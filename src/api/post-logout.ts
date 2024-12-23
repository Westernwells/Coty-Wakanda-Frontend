import { axios } from "@/lib/axios";

type ApiResponse = {
  message: string;
};

export const userLogout = async (): Promise<ApiResponse> => {
  const response = await axios.post("/logout");
  return response.data;
};
