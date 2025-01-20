import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { useMutation } from "@tanstack/react-query";

export type Data = {
  id: number
  product_id: number
  title: string
  url: string
  created_at: string
  updated_at: string
};

export type ApiResponseFiles = {
    data: {
      message: string;
      data: Data;
    };
};

export const addDocument = ({
  productId,
  data,
}: {
  productId: number;
  data: {title: string, url: string};
}): Promise<ApiResponseFiles> => {
  return axios.post(`/products/${productId}/documents`, data);
};

type UseAddDocumentOptions = {
  mutationConfig?: MutationConfig<typeof addDocument>;
};

export const useAddDocument = ({ mutationConfig }: UseAddDocumentOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: addDocument,
  });
};
