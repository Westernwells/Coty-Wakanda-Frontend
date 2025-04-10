import { Meta, PageParams, Royalty } from "@/types";

import { axios } from "@/lib/axios";

export type ApiResponse = {
  message: string;
  data: Royalty[];
  meta: Meta;
};

export const getRoyalties = async (
  params: PageParams
): Promise<ApiResponse> => {
  const response = await axios.get(`/royalties`, { params });
  return response.data;
};
