import { Innovation } from "@/types";

import { axios } from "@/lib/axios";

export type ApiResponse = {
  message: string;
  data: Innovation;
};

export const getInnovation = async (id: string): Promise<ApiResponse> => {
  const response = await axios.get(`/innovations/${id}`);
  return response.data;
};
