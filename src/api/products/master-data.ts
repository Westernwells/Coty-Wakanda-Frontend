import { axios } from "@/lib/axios";
import {
  MasterDistributor,
  MasterProduct,
  MasterProductFilters,
  Meta,
} from "@/types";

type GetProductsParams = {
  cursor?: number;
  page_size?: number;
  filter?: MasterProductFilters;
};

export type ApiResponse = {
  message: string;
  data: {
    products: MasterProduct[];
    distributors: MasterDistributor[];
  };
  meta: Meta;
};

export const getMasterData = async (
  params?: GetProductsParams
): Promise<ApiResponse> => {
  const formattedParams = {
    ...(params?.cursor !== undefined && { cursor: params.cursor }),
    ...(params?.page_size !== undefined && { page_size: params.page_size }),
    ...(params?.filter?.search?.trim() && { search: params.filter.search }),
    ...(params?.filter?.brand_id && { ['filter[brand_id]']: params.filter.brand_id }),
    ...(params?.filter?.distributor_id && { ['filter[distributor_id]']: params.filter.distributor_id }),
    ...(params?.filter?.house && { ['filter[house]']: params.filter.house }),
  };

  const response = await axios.get('/product-master-data', {
    params: formattedParams,
  });

  return response.data;
};
