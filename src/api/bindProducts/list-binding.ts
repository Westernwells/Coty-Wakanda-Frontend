import { ProductBinding } from "@/types";

import { axios } from "@/lib/axios";

export type ApiResponse = {
  message: string;
  data: ProductBinding[];
};

export const getProductBindings = async (
  distributorId: number
): Promise<ApiResponse> => {
  const response = await axios.get(`/distributors/${distributorId}/products`);
  return response.data;
};
