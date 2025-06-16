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
}
;import { useInfiniteQuery, UseInfiniteQueryOptions } from "@tanstack/react-query";
// import {  GetProductsParams, ApiResponse } from "./api";
export interface Product {
  id: number;
  house: string;
  description: string;
  brand: string;
  brand_line: string;
  article_type: string;
  irc: string;
  icp_eur: string;
  icp_usd: string;
  group: number;
}

export interface DistributorDataItem {
  product: string;
  irc: string;
  billing_price: number | null;
  rrsp: number | null;
  icp_eur: number | null;
  icp_usd: number | null;
  french_eur: number | null;
  french_usd: number | null;
  c1: number | null;
}

export interface Distributor {
  id: number;
  name: string;
  currency: string;
  data: DistributorDataItem[];
}

export interface MasterDataPayload {
  products: Product[];
  distributors: Distributor[];
}

export interface MetaX {
  cursor: number;
  page_size: number;
  has_previous: boolean;
  has_next: boolean;
  total: number;
}

export interface MasterDataResponse {
  message: string;
  data: MasterDataPayload;
  meta: MetaX;
}
export const useMasterData = (
  params: GetProductsParams,
  options?: Omit<
    UseInfiniteQueryOptions<
    MasterDataResponse,  
    Error,               
    MasterDataResponse, 
    MasterDataResponse,  
    unknown[],          
    number   
    >,
    "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
  >
) => {
  return useInfiniteQuery({
    queryKey: [
      "masterData",
      params.filter?.search,
      params.filter?.brand_id,
      params.filter?.distributor_id,
      params.filter?.house,
      params.page_size ?? 20,
    ] as const,
    queryFn: ({ pageParam = 1 }) =>
      getMasterData({
        cursor: pageParam,
        page_size: params.page_size ?? 20,
        filter: {
          ...(params.filter?.search && params.filter?.search?.trim() && { search: params.filter.search.trim() }),
          ...(params.filter?.brand_id && { brand_id: params.filter.brand_id }),
          ...(params.filter?.distributor_id && { distributor_id: params.filter.distributor_id }),
          ...(params.filter?.house && { house: params.filter.house }),
        },
      }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.has_next ? lastPage.meta.cursor : undefined,
    initialPageParam: 1,
    // keepPreviousData: true,
    ...options,
  });
};
