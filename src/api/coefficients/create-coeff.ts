import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

export const addCoeffecientInputSchema = z.object({
  type: z.enum(["regular", "giftset", "tester"]),
  pref_value: z.string().min(1, "Required"),
  non_pref_value: z.string().optional(),
});

export type addCoefficientInput = z.infer<typeof addCoeffecientInputSchema>;

export const addCoefficient = ({
  data,
  distributorId,
}: {
  data: addCoefficientInput;
  distributorId: number;
}): Promise<Comment> => {
  console.log("Distributor ID", distributorId);
  return axios.post(`/distributors/${distributorId}/coefficients`, data);
};

type UseAddCoefficientOptions = {
  mutationConfig?: MutationConfig<typeof addCoefficient>;
};

export const useAddCoefficient = ({
  mutationConfig,
}: UseAddCoefficientOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (_, variables, ...rest) => {
      // Invalidate specific distributor data
      queryClient.invalidateQueries({
        queryKey: ["distributors", variables.distributorId],
      });
      // Invalidate general distributors list
      queryClient.invalidateQueries({
        queryKey: ["distributors"],
      });
      onSuccess?.(_, variables, ...rest);
    },
    ...restConfig,
    mutationFn: addCoefficient,
  });
};
