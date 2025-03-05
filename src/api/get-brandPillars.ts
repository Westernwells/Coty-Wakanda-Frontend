import { axios } from "@/lib/axios";
import { Brand } from "@/types";

export type Pillar = {
  id: number;
  name: string;
  created_at: string;
  brand: Partial<Brand>;
};

export type ApiResponse = {
  message: string;
  data: Pillar[];
};

export const getBrandPillars = async (params?: {
  filter: {
    brand_id: number | string;
  };
}): Promise<ApiResponse> => {
  const response = await axios.get("/brand-pillars", { params });
  return response.data;
};
