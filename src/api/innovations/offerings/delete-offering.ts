import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const deleteOffering = ({
  innovationId,
  offeringId,
}: {
  innovationId: number | string;
  offeringId: number | string;
}): Promise<void> => {
  return axios.delete(`/innovations/${innovationId}/offerings/${offeringId}`);
};

type UseDeleteOfferingOptions = {
  mutationConfig?: MutationConfig<typeof deleteOffering>;
};

export const useDeleteOffering = ({
  mutationConfig,
}: UseDeleteOfferingOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...mutationConfig,
    mutationFn: deleteOffering,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["innovations", variables.innovationId.toString()],
        type: "all",
      });
      mutationConfig?.onSuccess?.(data, variables, context);
    },
  });
};
