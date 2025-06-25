import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { Lines } from "@/types";
import { useMutation } from "@tanstack/react-query";

// Define Line type if not already imported

export const updateLine = ({
  data,
}: {
  data: Pick<Lines, "id" | "name">;
}): Promise<Lines> => {
  return axios.put(`/lines/${data.id}`, data);
};

type UseUpdateLineOptions = {
  mutationConfig?: MutationConfig<typeof updateLine>;
};

export const useUpdateLine = ({ mutationConfig }: UseUpdateLineOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ["lines"],
        refetchType: "all",
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateLine,
  });
};
