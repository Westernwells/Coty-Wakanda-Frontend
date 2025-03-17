import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { Subcategory } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const updateSubcategory = ({
  data,
}: {
  data: Pick<Subcategory, "name" | "id">;
}): Promise<Comment> => {
  return axios.put(`/subcategories/${data.id}`, data);
};

type useUpdateSubcategoryOptions = {
  mutationConfig?: MutationConfig<typeof updateSubcategory>;
};

export const useUpdateSubcategory = ({
  mutationConfig,
}: useUpdateSubcategoryOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ["subcategories"],
        refetchType: "all",
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateSubcategory,
  });
};
