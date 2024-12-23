import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

export const updateDistributorInputSchema = z.object({
  type: z.string(),
  name: z.string(),
  regions: z.string().array(),
  markets: z.string().array(),
  company_registration_number: z.string(),
  contact_person: z.string(),
  contact_email: z.string(),
  categories: z.string().array(),
  brands: z.string().array(),
  brand_pillars: z.string().array(),
  currency: z.string(),
  mirror: z.object({
    group_one: z.number(),
    group_two: z.number(),
  }).optional(),
});

export type updateDistributorInput = z.infer<
  typeof updateDistributorInputSchema
>;

export const updateDistributor = ({
  data,
  distributorId,
}: {
  data: updateDistributorInput;
  distributorId: number;
}): Promise<Comment> => {
  return axios.put(`/distributors/${distributorId}`, data);
};

type UseUpdateDistributorOptions = {
  mutationConfig?: MutationConfig<typeof updateDistributor>;
};

export const useUpdateDistributor = ({
  mutationConfig,
}: UseUpdateDistributorOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateDistributor,
  });
};
