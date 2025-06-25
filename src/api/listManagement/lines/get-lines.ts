import { Lines, Meta, PageParams } from "@/types";
import { axios } from "@/lib/axios";

export type LinesApiResponse = {
  message: string;
  data: Pick<Lines, "id" | "name" | "created_at">[];
  meta: Meta;
};

export const getLines = async (
  params: PageParams
): Promise<LinesApiResponse> => {
  const response = await axios.get(`/lines`, { params });
  return response.data;
};
