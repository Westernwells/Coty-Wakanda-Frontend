import { axios } from "@/lib/axios";

export type Brand = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  brand_type_id: number;
  active: boolean;
};

export type ApiResponse = {
  message: string;
  data: Brand[];
};

interface GetBrandsParams {
  do_not_paginate?: 1;
}

export const getBrands = async (
  params?: GetBrandsParams
): Promise<ApiResponse> => {
  const response = await axios.get("/brands", { params });
  return response.data;
};
