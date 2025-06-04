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
      ...((params.filter as Filters).search?.trim() && { search: (params.filter as Filters).search.trim() }),
      ...(params.filter.brand_id && { brand_id: params.filter.brand_id }),
      ...(params.filter.sub_brand_id && { sub_brand_id: params.filter.sub_brand_id }),
      ...((params.filter as Filters).distributor_id && {
        distributor_id: (params.filter as Filters).distributor_id,
      }),
      ...((params.filter as Filters).division && { division: (params.filter as Filters).division }),
      ...((params.filter as Filters).category_id && { category_id: (params.filter as Filters).category_id }),
      ...((params.filter as Filters).region_id && { region_id: (params.filter as Filters).region_id }),
      ...((params.filter as Filters).market_id && { market_id: (params.filter as Filters).market_id }),
       ...(params.filter.brand_type && { brand_type: params.filter.brand_type }),
       ...('is_innovation_product' in params.filter && typeof params.filter.is_innovation_product === 'boolean' ? (params.filter.is_innovation_product ? { is_innovation_product: 1 } : {}) : {}),
    }),
  };

  const response = await axios.get('/products', {
    params: formattedParams,
  });

  return response.data;
};
