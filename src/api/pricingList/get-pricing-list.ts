import { axios } from "@/lib/axios";
import type { PricingList } from "@/types";
import type { GetPricingProductListResponse } from "./get-pricing-product-list";

interface GetPricingListResponse {
  message: string;
  data: PricingList[];
}

interface GetPricingListParams {
  cursor?: number;
  page_size?: number;
}

export async function getPricingList({
  cursor = 1,
  page_size = 20,
}: GetPricingListParams = {}): Promise<GetPricingListResponse> {
  const response = await axios.get<GetPricingListResponse>(
    `/pricing-lists?cursor=${cursor}&page_size=${page_size}`
  );
  return response.data;
}

export async function getPricingListByBrandType({
  brandType,
  cursor,
  pageSize,
  brandIds,
}: {
  brandType: string;
  cursor: number;
  pageSize: number;
  brandIds?: number[];
}): Promise<GetPricingProductListResponse> {
  const params = new URLSearchParams();
  params.append("cursor", cursor.toString());
  params.append("page_size", pageSize.toString());
  params.append("filter[brand_type]", brandType);

  if (brandIds?.length) {
    params.append("filter[brand_id]", brandIds.join(","));
    params.append("do_not_paginate", "1");
  }

  const response = await axios.get<GetPricingProductListResponse>(
    `/pricing-list-products?${params.toString()}`
  );
  return response.data;
}

export async function getPricingListByPricingId({
  pricingId,
  brandType,
  cursor,
  pageSize,
}: {
  pricingId: string;
  brandType: string;
  cursor: number;
  pageSize: number;
}): Promise<GetPricingProductListResponse> {
  const response = await axios.get<GetPricingProductListResponse>(
    `/pricing-list-products/${pricingId}?cursor=${cursor}&page_size=${pageSize}&filter[brand_type]=${brandType}`
  );
  return response.data;
}
