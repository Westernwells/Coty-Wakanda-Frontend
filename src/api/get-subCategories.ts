import { axios } from "@/lib/axios";
import { Category, Subcategory } from "@/types";

export type SubCategory = {
  id: number;
  name: string;
  created_at: string;
  Category: Category;
};

export type ApiResponse = {
  message: string;
  data: Subcategory[];
};

export const getSubCategories = async (params: {
  filter: {
    category_id: number | string;
  };
}): Promise<ApiResponse> => {
  const response = await axios.get("/sub-categories", { params });
  return response.data;
};
