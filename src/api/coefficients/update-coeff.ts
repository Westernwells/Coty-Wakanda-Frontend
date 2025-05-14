import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

export const updateCoeffecientInputSchema = z.object({
  value: z.string().min(1, "Required"),
  pref: z.enum(["pref", "non-pref"]),
  brand_id: z.string().min(1, "Required"),
  category_id: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
});

export type updateCoefficientInput = z.infer<
  typeof updateCoeffecientInputSchema
>;

export const updateCoefficient = ({
  data,
  distributorId,
  coeffId,
}: {
  data: updateCoefficientInput;
  distributorId: number;
  coeffId: number;
}): Promise<Comment> => {
  return axios.put(
    `/distributors/${distributorId}/coefficients/${coeffId}`,
    data
  );
};

type UseUpdateCoefficientOptions = {
  mutationConfig?: MutationConfig<typeof updateCoefficient>;
};

export const useUpdateCoefficient = ({
  mutationConfig,
}: UseUpdateCoefficientOptions) => {
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
    mutationFn: updateCoefficient,
  });
};
