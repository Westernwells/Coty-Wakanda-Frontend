import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { useMutation } from "@tanstack/react-query";

export const deleteSubcategory = (id: number): Promise<Comment> => {
  return axios.delete(`/subcategories/${id}`);
};

type useDeleteSubsubcategoryOptions = {
  mutationConfig?: MutationConfig<typeof deleteSubcategory>;
};

export const useDeleteSubcategory = ({
  mutationConfig,
}: useDeleteSubsubcategoryOptions) => {
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
    mutationFn: deleteSubcategory,
  });
};
