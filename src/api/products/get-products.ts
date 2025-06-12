import { axios } from "@/lib/axios";
import { BindingFilters, Filters, Meta, Product } from "@/types";

function isFilters(filter: Filters | BindingFilters): filter is Filters {
  return (filter as Filters).search !== undefined;
}

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
  const formattedParams = {
    ...(params?.cursor !== undefined && { cursor: params.cursor }),
    ...(params?.page_size !== undefined && { page_size: params.page_size }),

    ...(params?.filter && isFilters(params.filter) && {
      ...((params.filter as Filters).search?.trim() && { search: (params.filter as Filters)?.search?.trim() }),
      ...(params.filter.brand_id && { ["filter[brand_id]"]: params.filter.brand_id }),
      ...(params.filter.sub_brand_id && { ["filter[sub_brand_id]"]: params.filter.sub_brand_id }),
      ...((params.filter as Filters).distributor_id && {
        ["filter[distributor_id]"]: (params.filter as Filters).distributor_id,
      }),
      ...((params.filter as Filters).division && { ["filter[division]"]: (params.filter as Filters).division }),
      ...((params.filter as Filters).category_id && { ["filter[category_id]"]: (params.filter as Filters).category_id }),
      ...((params.filter as Filters).region_id && { ["filter[region_id]"]: (params.filter as Filters).region_id }),
      ...((params.filter as Filters).market_id && { ["filter[market_id]"]: (params.filter as Filters).market_id }),
       ...(params.filter.brand_type && params.filter?.brand_type !== "all" && { ["filter[brand_type]"]: params.filter.brand_type }),
       ...('is_innovation_product' in params.filter && typeof params.filter.is_innovation_product === 'boolean' ? (params.filter.is_innovation_product ? { ["filter[is_innovation_product]"]: 1 } : {["filter[is_innovation_product]"]: 0 }) : {}),
    }),
  };

  const response = await axios.get('/products', {
    params: formattedParams,
  });

  return response.data;
};
