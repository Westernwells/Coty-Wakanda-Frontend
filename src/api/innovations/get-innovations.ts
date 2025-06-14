import { Innovation } from "@/types";

import { axios } from "@/lib/axios";

export interface ApiResponse {
  message: string;
  data: Innovation[];
}

export const getInnovations = async (): Promise<ApiResponse> => {
  const response = await axios.get(`/innovations`);
  return response.data;
};
