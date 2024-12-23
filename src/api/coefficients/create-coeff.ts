import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

export const addCoeffecientInputSchema = z.object({
  value: z.string().min(1, "Required"),
  pref: z.enum(["pref", "non-pref"]),
  brand_id: z.string().min(1, "Required"),
  category_id: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
});

export type addCoefficientInput = z.infer<typeof addCoeffecientInputSchema>;

export const addCoefficient = ({
  data,
  distributorId,
}: {
  data: addCoefficientInput;
  distributorId: number;
}): Promise<Comment> => {
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
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: addCoefficient,
  });
};
