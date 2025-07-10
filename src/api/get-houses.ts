import { axios } from "@/lib/axios";
import { Houses } from "@/types";

export type ApiResponse = {
  message: string;
  data: Houses[];
};

export const getHouses = async (): Promise<ApiResponse> => {
  const response = await axios.get("/houses");
  return response.data;
};
