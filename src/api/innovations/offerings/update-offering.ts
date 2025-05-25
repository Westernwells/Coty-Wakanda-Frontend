import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateOfferingDTO } from "./create-offering";

export const updateOffering = ({
  innovationId,
  offeringId,
  data,
}: {
  innovationId: number | string;
  offeringId: number | string;
  data: CreateOfferingDTO;
}): Promise<any> => {
  return axios.put(
    `/innovations/${innovationId}/offerings/${offeringId}`,
    data
  );
};

type UseUpdateOfferingOptions = {
  mutationConfig?: MutationConfig<typeof updateOffering>;
};

export const useUpdateOffering = ({
  mutationConfig,
}: UseUpdateOfferingOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...mutationConfig,
    mutationFn: updateOffering,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["innovations", variables.innovationId.toString()],
        type: "all",
      });
      mutationConfig?.onSuccess?.(data, variables, context);
    },
  });
};
