import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { InnovationInput, ForecastSubmitInput } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type UpdateInnovationDTO = Omit<InnovationInput, "offerings"> & {
  forecast?: ForecastSubmitInput[];
};

export const updateInnovation = ({
  data,
  innovationId,
}: {
  data: UpdateInnovationDTO;
  innovationId: number;
}): Promise<void> => {
  return axios.put(`/innovations/${innovationId}`, data);
};

type UseUpdateInnovationOptions = {
  mutationConfig?: MutationConfig<typeof updateInnovation>;
};

export const useUpdateInnovation = ({
  mutationConfig,
}: UseUpdateInnovationOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...mutationConfig,
    mutationFn: updateInnovation,
    onSuccess: (data, variables, context) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["innovations"],
        type: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["innovations", variables.innovationId.toString()],
        type: "all",
      });
      mutationConfig?.onSuccess?.(data, variables, context);
    },
  });
};
