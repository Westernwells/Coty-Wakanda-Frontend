import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { Subcategory } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const addSubcategory = ({
  data,
}: {
  data: Pick<Subcategory, "name" | "category_id">;
}): Promise<Comment> => {
  return axios.post(`/subcategories`, data);
};

type useAddSubcategoryOptions = {
  mutationConfig?: MutationConfig<typeof addSubcategory>;
};

export const useAddSubcategory = ({
  mutationConfig,
}: useAddSubcategoryOptions) => {
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
    mutationFn: addSubcategory,
  });
};
