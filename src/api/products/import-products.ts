import { useMutation } from "@tanstack/react-query";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { axios } from "@/lib/axios";

export const importProducts = (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file, file.name);

  return axios
    .post("/product-import", formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    })
    .then(() => {
      return;
    });
};

export type UseImportProductsOptions = {
  mutationConfig?: MutationConfig<typeof importProducts>;
};

export const useImportProducts = ({
  mutationConfig,
}: UseImportProductsOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: importProducts,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
