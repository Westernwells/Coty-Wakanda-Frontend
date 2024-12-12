import { axios } from "@/lib/axios";
import { LoginValues } from "@/types";

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
};

type ApiResponse = {
  message: string;
  data: {token: string, user: User};
};

export const userLogin = async (values: LoginValues): Promise<ApiResponse> => {
  const response = await axios.post("/login", values);
  return response.data;
};
