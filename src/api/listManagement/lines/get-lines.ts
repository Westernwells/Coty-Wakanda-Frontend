import { Line, Meta, PageParams } from "@/types";
import { axios } from "@/lib/axios";

export type LinesApiResponse = {
  message: string;
  data: Line[];
  meta: Meta;
};

export const getLines = async (
  params: PageParams
): Promise<LinesApiResponse> => {
  const response = await axios.get(`/lines`, { params });
  return response.data;
};
