import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { Category } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const updateCategory = ({
  data,
}: {
  data: Pick<Category, "name" | "id">;
}): Promise<Comment> => {
  return axios.put(`/categories/${data.id}`, data);
};

type useUpdateCategoryOptions = {
  mutationConfig?: MutationConfig<typeof updateCategory>;
};

export const useUpdateCategory = ({
  mutationConfig,
}: useUpdateCategoryOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
        refetchType: "all",
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateCategory,
  });
};
