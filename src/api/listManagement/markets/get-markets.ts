import { Market, Meta, PageParams } from "@/types";

import { axios } from "@/lib/axios";

export type ApiResponse = {
  message: string;
  data: Pick<Market, "id" | "name" | "created_at">[];
  meta: Meta;
};

export const getMarkets = async (params: PageParams): Promise<ApiResponse> => {
  const response = await axios.get(`/markets`, { params });
  return response.data;
};
