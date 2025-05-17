import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

export const updateDistributorInputSchema = z.object({
  type: z.string().min(1, { message: "Type is required" }),
  account_type: z
    .enum(["luxury", "consumer beauty"], {
      message: "Account type must be either luxury or consumer beauty",
    })
    .nullable(),
  name: z.string().min(1, { message: "Name is required" }),
  regions: z.string().array().min(1, { message: "Regions is required" }),
  markets: z.string().array().optional(),
  company_registration_number: z.string().min(1, {
    message: "Company registration number is required",
  }),
  contact_person: z.string().min(1, { message: "Contact person is required" }),
  contact_email: z.string().email({ message: "Invalid email format" }),
  categories: z.string().array().min(1, { message: "Categories is required" }),
  currency: z.string().min(1, { message: "Currency is required" }),
  coefficients: z
    .array(
      z.object({
        type: z.enum(["regular", "giftset", "tester"]),
        pref_value: z.string().min(1, "Required"),
        non_pref_value: z.string().optional(),
        brand_id: z.number(),
        category_id: z.number(),
        description: z.string().optional(),
      })
    )
    .optional(),
});

export type UpdateDistributorInput = z.infer<
  typeof updateDistributorInputSchema
>;

// Define the response type
export type UpdateDistributorResponse = {
  id: number;
  type: string;
  account_type: "luxury" | "consumer beauty";
  name: string;
  regions: number[];
  markets: number[];
  company_registration_number: string;
  contact_person: string;
  contact_email: string;
  categories: number[];
  currency: string;
  created_at: string;
  updated_at: string;
};

export const updateDistributor = ({
  data,
  distributorId,
}: {
  data: UpdateDistributorInput;
  distributorId: number;
}): Promise<UpdateDistributorResponse> => {
  return axios.put(`/distributors/${distributorId}`, data);
};

type UseUpdateDistributorOptions = {
  mutationConfig?: MutationConfig<typeof updateDistributor>;
};

export const useUpdateDistributor = ({
  mutationConfig,
}: UseUpdateDistributorOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...mutationConfig,
    mutationFn: updateDistributor,
    onSuccess: (data, variables, context) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["distributors"],
        type: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["distributor", variables.distributorId.toString()],
        type: "all",
      });
      mutationConfig?.onSuccess?.(data, variables, context);
    },
  });
};
