import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

export const updateDistributorInputSchema = z.object({
    type: z.string().min(1, { message: "Type is required" }),
    name: z.string().min(1, { message: "Name is required" }),

    regions: z.string().array().min(1, { message: "Regions is required" }),
    markets: z.string().array().min(1, { message: "Markets is required" }),
    company_registration_number: z
        .string({
            coerce: true,
            message: "Company registration number is required",
        })
        .min(1, { message: "Company registration number is required" }),
    contact_person: z
        .string()
        .min(1, { message: "Contact person is required" }),
    contact_email: z
        .string()
        .email({ message: "This should be an email" })
        .min(1, { message: "Contact email is required" }),
    categories: z
        .string()
        .array()
        .min(1, { message: "Categories is required" }),
    brands: z.string().array().min(1, { message: "Brands is required" }),

    currency: z.string().min(1, { message: "Currency is required" }),
    mirror: z
        .object({
            group_one: z.string(),
            group_two: z.string(),
        })
        .optional(),
    coefficients: z
        .object({
            brand_id: z.number({
                coerce: true,
                message: "Brand id is required",
            }),
            category_id: z.number({
                coerce: true,
                message: "Brand id is required",
            }),
            pref: z.enum(["pref", "non-pref"], { message: "Pref is required" }),
            value: z.string().min(1, { message: "Value is required" }),
        })
        .array()
        .min(1, { message: "Coefficients is required" }),
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
