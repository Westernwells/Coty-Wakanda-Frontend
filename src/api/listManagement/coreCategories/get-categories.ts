import { Category, Meta, PageParams } from "@/types";

import { axios } from "@/lib/axios";

export type ApiResponse = {
  message: string;
  data: Pick<Category, "id" | "name" | "created_at">[];
  meta: Meta;
};

export const getCategories = async (
  params: PageParams
): Promise<ApiResponse> => {
  const response = await axios.get(`/categories`, { params });
  return response.data;
};
