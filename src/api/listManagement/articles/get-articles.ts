import { Meta } from "@/types";

import { axios } from "@/lib/axios";

export type ApiResponse = {
  message: string;
  data: string[];
  meta: Meta;
};

export const getArticles = async (): Promise<ApiResponse> => {
  const response = await axios.get(`/article-types`);
  return response.data;
};
