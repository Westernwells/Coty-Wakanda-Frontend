import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { Category } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const addCategory = ({
  data,
}: {
  data: Pick<Category, "name">;
}): Promise<Comment> => {
  return axios.post(`/categories`, data);
};

type useAddCategoryOptions = {
  mutationConfig?: MutationConfig<typeof addCategory>;
};

export const useAddCategory = ({ mutationConfig }: useAddCategoryOptions) => {
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
    mutationFn: addCategory,
  });
};
