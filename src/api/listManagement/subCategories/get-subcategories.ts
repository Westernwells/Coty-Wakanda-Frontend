import { Meta, PageParams, Subcategory } from "@/types";

import { axios } from "@/lib/axios";

export type ApiResponse = {
  message: string;
  data: Pick<Subcategory, "id" | "name" | "created_at">[];
  meta: Meta;
};

export const getSubcategories = async (
  params: PageParams
): Promise<ApiResponse> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const response = await axios.get(`/subcategories`, { params });
  return response.data;
};
