import { axios } from "@/lib/axios";
import { BindingFilters, Filters, Meta, Product } from "@/types";

type GetProductsParams = {
  cursor?: number;
  page_size?: number;
  include?: string;
  filter?: Filters | BindingFilters;
};

export type ApiResponse = {
  message: string;
  data: Product[];
  meta: Meta;
};

export const getProducts = async (
  params?: GetProductsParams
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

  const response = await axios.get("/products", { params: formattedParams });
  return response.data;
};
