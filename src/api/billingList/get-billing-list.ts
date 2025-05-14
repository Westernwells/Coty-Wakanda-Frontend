import { axios } from "@/lib/axios";
import { type GetBillingProductListResponse } from "./get-billing-product-list";

interface BillingList {
  id: number;
  name: string;
  type: string;
  description: string | null;
  created_at: string;
}

interface GetBillingListParams {
  cursor?: number;
  page_size?: number;
}

interface GetBillingListResponse {
  data: BillingList[];
  total_count: number;
}

export async function getBillingList({
  cursor,
  page_size = 10,
}: GetBillingListParams): Promise<GetBillingListResponse> {
  const response = await axios.get<GetBillingListResponse>("/billing-lists", {
    params: {
      cursor,
      page_size,
    },
  });
  return response.data;
}

export async function getBillingListByBrandType({
  brandType,
  cursor,
  pageSize,
  brandIds,
  forceDoNotPaginate,
}: {
  brandType: string;
  cursor: number;
  pageSize: number;
  brandIds?: number[];
  forceDoNotPaginate?: boolean;
}): Promise<GetBillingProductListResponse> {
  const params = new URLSearchParams();
  params.append("cursor", cursor.toString());
  params.append("page_size", pageSize.toString());
  params.append("filter[brand_type]", brandType);

  if (brandIds?.length) {
    params.append("filter[brand_id]", brandIds.join(","));
    params.append("do_not_paginate", "1");
  }

  if (forceDoNotPaginate) {
    params.append("do_not_paginate", "1");
  }

  const response = await axios.get<GetBillingProductListResponse>(
    `/billing-list-products?${params.toString()}`
  );
  return response.data;
}

export async function getBillingListByBillingId({
  billingId,
  brandType,
  cursor,
  pageSize,
  brandIds,
  forceDoNotPaginate,
}: {
  billingId: string;
  brandType: string;
  cursor: number;
  pageSize: number;
  brandIds?: number[];
  forceDoNotPaginate?: boolean;
}): Promise<GetBillingProductListResponse> {
  const params = new URLSearchParams();
  params.append("cursor", cursor.toString());
  params.append("page_size", pageSize.toString());
  params.append("filter[brand_type]", brandType);

  if (brandIds?.length) {
    params.append("filter[brand_id]", brandIds.join(","));
    params.append("do_not_paginate", "1");
  }

  if (forceDoNotPaginate) {
    params.append("do_not_paginate", "1");
  }

  const response = await axios.get<GetBillingProductListResponse>(
    `/billing-list-products/${billingId}?${params.toString()}`
  );
  return response.data;
}
