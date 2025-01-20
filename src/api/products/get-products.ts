import { axios } from "@/lib/axios";
import { Meta, Product } from "@/types";

type GetProductsParams = {
  page?: number;
  per_page?: number;
};

export type ApiResponse = {
  message: string;
  data: Product[];
  meta: Meta;
};

export const getProducts = async (
  params?: GetProductsParams
): Promise<ApiResponse> => {
  const response = await axios.get("/products", { params });
  return response.data;
};
