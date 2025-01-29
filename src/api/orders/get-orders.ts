import { OrderData } from "@/types";
import { axios } from "@/lib/axios";

export type ApiResponse = {
  message: string;
  data: { order: OrderData[] };
};

export const getOrders = async (): Promise<ApiResponse> => {
  const response = await axios.get(`/orders/data`);
  return response.data;
};
