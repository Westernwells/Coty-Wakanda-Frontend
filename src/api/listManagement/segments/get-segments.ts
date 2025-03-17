import { Meta, PageParams, Segment } from "@/types";

import { axios } from "@/lib/axios";

export type ApiResponse = {
  message: string;
  data: Pick<Segment, "id" | "name" | "created_at">[];
  meta: Meta;
};

export const getSegments = async (params: PageParams): Promise<ApiResponse> => {
  const response = await axios.get(`/segments`, { params });
  return response.data;
};
