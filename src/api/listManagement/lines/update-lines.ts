import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { Line } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { on } from "events";

// Define Line type if not already imported

export const updateLine = ({
  data,
}: {
  data: Pick<Line, "id" | "name">;
}): Promise<Line> => {
  return axios.put(`/lines/${data.id}`, data);
};

type UseUpdateLineOptions = {
  mutationConfig?: MutationConfig<typeof updateLine>;
};

export const useUpdateLine = ({ mutationConfig }: UseUpdateLineOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    ...restConfig,
    mutationFn: updateLine,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ["lines"],
        type: "all",
      });
      if(onSuccess) {

        onSuccess?.(...args);
      }
    },
  });
};
