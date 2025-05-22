import { axios } from "@/lib/axios";
import { BindingFilters, Filters, Meta } from "@/types";
import { useQuery } from "@tanstack/react-query";

type GetDocumentsParams = {
  cursor?: number;
  page_size?: number;
  include?: string;
  filter?: Filters | BindingFilters;
  product_id?: string;
};

type Document = {
  id: string;
  title: string;
  url: string;
};

export type ApiResponse = {
  message: string;
  data: Document[];
  meta: Meta;
};

export const getDocuments = async (
  params?: GetDocumentsParams
): Promise<ApiResponse> => {
  const formattedParams =
    params?.filter && "search" in params.filter
      ? {
          cursor: params?.cursor || 1,
          page_size: params?.page_size || 20,
          search: params?.filter?.search || "",
          "filter[brand_id]": params?.filter?.brand_id || "",
          "filter[sub_brand_id]": params?.filter?.sub_brand_id || "",
          "filter[distributor_id]": params?.filter?.distributor_id || "",
          "filter[division]": params?.filter?.division || "",
        }
      : params;

  const response = await axios.get(
    `/products/${params?.product_id}/documents`,
    {
      params: formattedParams,
    }
  );
  return response.data;
};

export const useGetDocuments = (params?: GetDocumentsParams) => {
  return useQuery({
    queryKey: ["documents", params?.product_id, params],
    queryFn: () => getDocuments(params),
    enabled: !!params?.product_id,
  });
};
