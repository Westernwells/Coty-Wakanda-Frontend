import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { useMutation } from "@tanstack/react-query";

type StatusUpdateRequest =
  | {
      distributorId: number;
      productId: number;
      status: "hidden" | "visible";
    }
  | {
      distributorId: number;
      products: number[];
      status: "hidden" | "visible";
    };

export const updateProductsStatus = (
  request: StatusUpdateRequest
): Promise<{ message: string }> => {
  const { distributorId, status } = request;

  const productIds =
    "productId" in request ? [request.productId] : request.products;

  return axios.post(
    `/distributors/${distributorId}/products/bulk-status-update`,
    {
      products: productIds,
      productIds,
      status,
    }
  );
};

type UseUpdateProductsStatusOptions = {
  config?: MutationConfig<typeof updateProductsStatus>;
};

export const useUpdateProductsStatus = ({
  config,
}: UseUpdateProductsStatusOptions = {}) => {
  const { onSuccess, ...restConfig } = config || {};

  return useMutation({
    ...restConfig,
    mutationFn: updateProductsStatus,
    onSuccess: (data, variables, context) => {
      const { distributorId } = variables;
      const updatedProductIds =
        "productId" in variables ? [variables.productId] : variables.products;
      const newStatus = variables.status;

      // Manually update the cache
      // queryClient.setQueryData(
      //   ["products", { distributorId }],
      //   (oldData: any) => {
      //     if (!oldData) return oldData;

      //     return {
      //       ...oldData,
      //       pages: oldData.pages.map((page: any) => ({
      //         ...page,
      //         data: page.data.map((product: any) =>
      //           updatedProductIds.includes(product.id)
      //             ? {
      //                 ...product,
      //                 pricing: {
      //                   ...product.pricing,
      //                   status: newStatus,
      //                 },
      //               }
      //             : product
      //         ),
      //       })),
      //     };
      //   }
      // );

      // Optional: background refetch
      queryClient.invalidateQueries({
        queryKey: ["products", { distributorId }],
        // exact: false,
        // refetchType: "inactive",
      });

      onSuccess?.(data, variables, context);
    },
  });
};
