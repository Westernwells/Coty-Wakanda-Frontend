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
  const formattedParams =
    params?.filter && "search" in params.filter
      ? {
          cursor: params?.cursor || 1,
          page_size: params?.page_size || 20,
          search: params?.filter?.search || "",
          "filter[brand_id]": params?.filter?.brand_id || "20",
          "filter[distributor_id]": params?.filter?.distributor_id || "25",
          "filter[house]": params?.filter?.house || "burberry",
        }
      : params;

  const response = await axios.get("/product-master-data", {
    params: formattedParams,
  });
  return response.data;
};
