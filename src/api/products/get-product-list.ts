import { ProductListResponse } from "@/types";
import { axios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface GetProductListParams {
  distributorId: number;
  cursor?: number;
  pageSize?: number;
}

export const getProductList = async ({
  distributorId,
  cursor = 1,
  pageSize = 20,
}: GetProductListParams): Promise<ProductListResponse> => {
  const response = await axios.get(
    `/distributors/${distributorId}/products?cursor=${cursor}&page_size=${pageSize}`
  );
  return response.data;
};

export const useGetProductList = (params: GetProductListParams) => {
  const { distributorId, cursor = 1, pageSize = 20 } = params;

  return useQuery({
    queryKey: ["products", { distributorId, cursor, pageSize }],
    queryFn: () => getProductList(params),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
};
