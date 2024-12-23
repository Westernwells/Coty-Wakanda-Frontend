import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

export const addDistributorInputSchema = z.object({
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
  coefficients: z.object({
        value: z.string(),
        brand_id: z.number(),
        category_id: z.number(),
        pref: z.enum(['pref', 'non-pref'])
  }).array()
});

export type addDistributorInput = z.infer<
  typeof addDistributorInputSchema
>;

export const addDistributor = ({
  data,
}: {
  data: addDistributorInput;
}): Promise<Comment> => {
  return axios.post(`/distributors/`, data);
};

type UseAddDistributorOptions = {
  mutationConfig?: MutationConfig<typeof addDistributor>;
};

export const useAddDistributor = ({
  mutationConfig,
}: UseAddDistributorOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: addDistributor,
  });
};
