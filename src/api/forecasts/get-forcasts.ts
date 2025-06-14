import { ForecastData, ForecastFilters, Meta } from "@/types";

import { axios } from "@/lib/axios";
import { useInfiniteQuery, UseInfiniteQueryOptions } from '@tanstack/react-query';

type GetForecastsParams = {
    cursor?: number;
    page_size?: number;
    include?: string;
    filter?: ForecastFilters;
};
export type ApiResponse = {
    message: string;
    data: { forecast: ForecastData[] };
    meta: Meta;
};

export const getForecasts = async (
    params?: GetForecastsParams
  ): Promise<ApiResponse> => {
    const formattedParams = {
      ...(params?.cursor !== undefined && { cursor: params.cursor }),
      ...(params?.page_size !== undefined && { page_size: params.page_size }),
  
      ...(params?.filter?.search?.trim() && { search: params.filter.search.trim() }),
      ...(params?.filter?.brand_id && { ["filter[brand_id]"]: params.filter.brand_id }),
      ...(params?.filter?.sub_brand_id && { ["filter[sub_brand_id]"]: params.filter.sub_brand_id }),
      ...(params?.filter?.distributor_id && { ["filter[distributor_id]"]: params.filter.distributor_id }),
      ...(params?.filter?.brand_type && params.filter.brand_type !== "all" && {
        ["filter[brand_type]"]: params.filter.brand_type,
      }),
      ...(params?.filter?.launch_id && { ["filter[launch_id]"]: params.filter.launch_id }),
      ...(params?.filter?.start_date && { ["filter[start_date]"]: params.filter.start_date }),
      ...(params?.filter?.end_date && { ["filter[end_date]"]: params.filter.end_date }),
      ...(params?.filter?.type && { ["filter[type]"]: params.filter.type }),
      ...(params?.filter?.sort && { sort: params.filter.sort }),
    };
  
    const response = await axios.get(`/forecasts/data`, {
      params: formattedParams,
    });
  
    return response.data;
  };
export interface ForecastItem {
    distributor?: {
      id: number;
      name: string;
      currency: string;
    };
    product: {
      id: number;
      offering_number: string | null;
      sku: string;
      launch_id: number | null;
      brand: {
        id: number;
        name: string;
      };
      brand_pillar: {
        id: number;
        name: string;
      };
    };
    cost: number;
    monthly_total: number;
    sub_total: number;
    items: Record<
      string,
      {
        value: number;
        is_closed: boolean;
      }
    >;
  }
export interface ForecastMeta {
    cursor: number;
    page_size: number;
    has_previous: boolean;
    has_next: boolean;
    total: number;
  }
  
  export interface ForecastApiResponse {
    message: string;
    data: {
      forecast: ForecastItem[];
    };
    meta: ForecastMeta;
  }

  export interface InnovationForecastApiResponse {
    message: string;
    data: { forecast: ForecastItem[] };
    meta: ForecastMeta;
  }
export const getBaseForecasts = async (
    params?: GetForecastsParams
  ): Promise<ForecastApiResponse> => {
    const formattedParams = {
      ...(params?.cursor !== undefined && { cursor: params.cursor }),
      ...(params?.page_size !== undefined && { page_size: params.page_size }),
      ...(params?.filter?.search?.trim() && { search: params.filter.search.trim() }),
      ...(params?.filter?.brand_id && { ['filter[brand_id]']: params.filter.brand_id }),
      ...(params?.filter?.sub_brand_id && { ['filter[sub_brand_id]']: params.filter.sub_brand_id }),
      ...(params?.filter?.distributor_id && { ['filter[distributor_id]']: params.filter.distributor_id }),
      ...(params?.filter?.brand_type && params.filter.brand_type !== 'all' && {
        ['filter[brand_type]']: params.filter.brand_type,
      }),
      ...(params?.filter?.launch_id && { ['filter[launch_id]']: params.filter.launch_id }),
      ...(params?.filter?.start_date && { ['filter[start_date]']: params.filter.start_date }),
      ...(params?.filter?.end_date && { ['filter[end_date]']: params.filter.end_date }),
      ...(params?.filter?.type && { ['filter[type]']: params.filter.type }),
      ...(params?.filter?.sort && { sort: params.filter.sort }),
    };
  
    const response = await axios.get('/forecasts/data', {
      params: formattedParams,
    });
  
    return response.data;
  };

  export const getInnovationForecasts = async (
    params?: {
      cursor?: number;
      page_size?: number;
      filter?: {
        search?: string;
        start_date?: string;
        end_date?: string;
        brand_id?: number | string;
        sub_brand_id?: string | number;
        distributor_id?: string | number;
        launch_id?: string | number;
        sort?: string;
        type?: string;
        brand_type?: string;
      };
    }
  ): Promise<InnovationForecastApiResponse> => {
    const { cursor, page_size, filter } = params || {};
    const formatted: Record<string, any> = {
      ...(cursor !== undefined && { cursor }),
      ...(page_size !== undefined && { page_size }),
      ...(filter?.search?.trim() && { search: filter.search.trim() }),
      ...(filter?.brand_id && { "filter[brand_id]": filter.brand_id }),
      ...(filter?.sub_brand_id && { "filter[sub_brand_id]": filter.sub_brand_id }),
      ...(filter?.distributor_id && { "filter[distributor_id]": filter.distributor_id }),
      ...(filter?.brand_type && filter.brand_type !== "all" && { "filter[brand_type]": filter.brand_type }),
      ...(filter?.launch_id && { "filter[launch_id]": filter.launch_id }),
      ...(filter?.start_date && { "filter[start_date]": filter.start_date }),
      ...(filter?.end_date && { "filter[end_date]": filter.end_date }),
      ...(filter?.type && { "filter[type]": filter.type }),
      ...(filter?.sort && { sort: filter.sort }),
    };
  
    const res = await axios.get<InnovationForecastApiResponse>(
      "/innovation-forecasts/data",
      { params: formatted }
    );
    return res.data;
  };

type BaseForecastParams = {
  searchQuery?: string;
  brand_id?: number | string;
  sub_brand_id?: number | string;
  distributor_id?: number | string;
  brand_type?: string;
  launch_id?: number | string;
  start_date?: string;
  end_date?: string;
  type?: string;
  sort?: string;
  pageSize?: number;
};


export const useBaseForecasts = (
    filters: BaseForecastParams = {},
    options?:  Omit<
    UseInfiniteQueryOptions<
      ForecastApiResponse,  
      Error,               
      ForecastApiResponse, 
      ForecastApiResponse,  
      unknown[],          
      number                
    >,
    "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
  >
  ) => {
    return useInfiniteQuery({
      queryKey: [
        'base-forecasts',
        filters.searchQuery,
        filters.brand_id,
        filters.sub_brand_id,
        filters.distributor_id,
        filters.brand_type,
        filters.launch_id,
        filters.start_date,
        filters.end_date,
        filters.type,
        filters.sort,
        filters.pageSize
      ],
      queryFn: async ({ pageParam = 1 }) => {
        return getBaseForecasts({
          cursor: pageParam,
          page_size: filters.pageSize ?? 20,
          filter: {
           
            ...(filters.searchQuery && { search: filters.searchQuery }),
            ...(filters.brand_id && { brand_id: filters.brand_id }),
            ...(filters.sub_brand_id && { sub_brand_id: filters.sub_brand_id }),
            ...(filters.distributor_id && { distributor_id: filters.distributor_id }),
            ...(filters.brand_type && filters.brand_type !== 'all' && { brand_type: filters.brand_type }),
            ...(filters.launch_id && { launch_id: filters.launch_id }),
            ...(filters.start_date && { start_date: filters.start_date }),
            ...(filters.end_date && { end_date: filters.end_date }),
            ...(filters.type && { type: filters.type }),
            ...(filters.sort && { sort: filters.sort }),
          },
        });
      },
      getNextPageParam: (lastPage) => {
        return lastPage.meta.has_next ? lastPage.meta.cursor : undefined;
      },
      initialPageParam: 1,
      ...options,
    });
  };

  export const useInnovationForecasts = (
    filters: BaseForecastParams = {},
    options?: Omit<UseInfiniteQueryOptions<
      InnovationForecastApiResponse, 
      Error,                        
      InnovationForecastApiResponse, 
      InnovationForecastApiResponse,
      unknown[],                   
      number                        
    >, "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam">
  ) => {
    return useInfiniteQuery({
      queryKey: [
        "innovation-forecasts",
        filters,
      ],
      queryFn: async ({ pageParam = 1 }) => {
        return getInnovationForecasts({
          cursor: pageParam,
          page_size: filters.pageSize ?? 20,
          filter: {
            ...(filters.searchQuery && { search: filters.searchQuery }),
            ...(filters.brand_id && { brand_id: filters.brand_id }),
            ...(filters.sub_brand_id && { sub_brand_id: filters.sub_brand_id }),
            ...(filters.distributor_id && { distributor_id: filters.distributor_id }),
            ...(filters.brand_type && filters.brand_type !== 'all' && { brand_type: filters.brand_type }),
            ...(filters.launch_id && { launch_id: filters.launch_id }),
            ...(filters.start_date && { start_date: filters.start_date }),
            ...(filters.end_date && { end_date: filters.end_date }),
            ...(filters.type && { type: filters.type }),
            ...(filters.sort && { sort: filters.sort }),
          },
        });
      },
      getNextPageParam: (lastPage) =>
        lastPage?.meta?.has_next ? lastPage?.meta?.cursor + 1 : undefined,
      initialPageParam: 1,
      ...options,
    });
  };