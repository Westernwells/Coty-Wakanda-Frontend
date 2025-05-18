import { useMutation } from "@tanstack/react-query";
import { axios } from "@/lib/axios";
import { queryClient } from "@/main";
import { Product } from "@/types";

interface BulkEditPayload {
  products: Partial<Product>[];
}

async function innovationBulkEdit({ data }: { data: BulkEditPayload }) {
  return axios.post("/product-bulk-update", data);
}

export function useInnovationBulkEdit(options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) {
  return useMutation({
    mutationFn: innovationBulkEdit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}
