import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { Product } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

export const addProductSchema = z.object({
  pref: z.enum(["pref", "non-pref"], {
    message: "This field is required",
  }),
  product_type: z.string().min(1, { message: "This field is required" }),
  grouping: z.enum(["1", "2", "3"], {
    message: "This field is required",
  }),
  launch_date: z.date({ message: "This field is required" }),
  discontinue_date: z.date({ message: "This field is required" }),
  offering_number: z
    .number({ coerce: true })
    .min(1, { message: "This field is required" }),
  irc: z.string().min(1, { message: "This field is required" }),
  material_description: z
    .string()
    .min(1, { message: "This field is required" }),
  ean_upc: z.string().min(1, { message: "This field is required" }),
  house: z.string().min(1, { message: "This field is required" }),
  brand_id: z.string().min(1, { message: "This field is required" }),
  line: z.string().min(1, { message: "This field is required" }),
  line_id: z
    .number({
      coerce: true,
      message: "This field should have a numeric value",
    })
    .min(1, { message: "This field is required" }),
  article_type: z.string().min(1, { message: "This field is required" }),
  division: z.string().min(1, { message: "This field is required" }),
  category_id: z
    .number({
      coerce: true,
      message: "This field should have a numeric value",
    })
    .min(1, { message: "This field is required" }),
  subcategory_id: z
    .number({
      coerce: true,
      message: "This field should have a numeric value",
    })
    .min(1, { message: "This field is required" }),
  market_id: z
    .number({
      coerce: true,
      message: "This field should have a numeric value",
    })
    .min(1, { message: "This field is required" }),
  segment_id: z
    .number({
      coerce: true,
      message: "This field should have a numeric value",
    })
    .min(1, { message: "This field is required" }),
  icp_eur: z
    .number({
      coerce: true,
      message: "This field should have a numeric value",
    })
    .min(1, { message: "This field is required" }),
  icp_usd: z
    .number({
      coerce: true,
      message: "This field should have a numeric value",
    })
    .min(1, { message: "This field is required" }),
  factory: z.string().min(1, { message: "This field is required" }),
  commodity_id: z
    .number({
      coerce: true,
      message: "This field should have a numeric value",
    })
    .min(1, { message: "This field is required" }),
  country_id: z
    .number({
      coerce: true,
      message: "This field should have a numeric value",
    })
    .min(1, { message: "This field is required" }),
  gender: z.enum(["male", "female"], {
    message: "This value should be either male or female",
  }),
  size: z.string().min(1, { message: "This field is required" }),
  length: z
    .number({
      coerce: true,
      message: "This field should have a numeric value",
    })
    .min(1, { message: "This field is required" }),
  height: z
    .number({
      coerce: true,
      message: "This field should have a numeric value",
    })
    .min(1, { message: "This field is required" }),
  width: z
    .number({
      coerce: true,
      message: "This field should have a numeric value",
    })
    .min(1, { message: "This field is required" }),
  volume: z
    .number({
      coerce: true,
      message: "This field should have a numeric value",
    })
    .min(1, { message: "This field is required" }),
  gross_weight: z
    .number({
      coerce: true,
      message: "This field should have a numeric value",
    })
    .min(1, { message: "This field is required" }),
  net_weight: z
    .number({
      coerce: true,
      message: "This field should have a numeric value",
    })
    .min(1, { message: "This field is required" }),
  units: z
    .number({
      coerce: true,
      message: "This field should have a numeric value",
    })
    .min(1, { message: "This field is required" }),
  price_benchmark: z.union([
    z
      .object({
        brand_id: z
          .string({
            coerce: true,
            message: "This field should have a numeric value",
          })
          .min(1, { message: "This field is required" })
          .optional(),
        product_id: z
          .number({
            coerce: true,
            message: "This field should have a numeric value",
          })
          .optional(),
        index_value: z
          .number({
            coerce: true,
            message: "This field should have a numeric value",
          })
          .min(1, { message: "This field is required" })
          .optional(),
        comment: z.string().optional(),
      })
      .optional(),
    z.undefined(),
  ]),
  distributor_pricing: z
    .array(
      z.object({
        distributor_id: z
          .number({
            coerce: true,
            message: "This field should have a numeric value",
          })
          .min(1, { message: "This field is required" }),
        coefficient_id: z
          .number({
            coerce: true,
            message: "This field should have a numeric value",
          })
          .min(1, { message: "This field is required" }),
        preactive_rrsp: z
          .number({
            coerce: true,
            message: "This field should have a numeric value",
          })
          .min(1, { message: "This field is required" }),
        active_rrsp: z
          .number({
            coerce: true,
            message: "This field should have a numeric value",
          })
          .min(1, { message: "This field is required" }),
        billing: z
          .number({
            coerce: true,
            message: "This field should have a numeric value",
          })
          .min(1, { message: "This field is required" }),
        currency: z.string(),
      })
    )
    .optional(),
  documents: z
    .array(z.object({ title: z.string(), url: z.string() }))
    .optional(),
});

export const addProduct = ({
  data,
}: {
  data: Partial<Product>;
}): Promise<Comment> => {
  const body = {
    ...data,
  };
  return axios.post(`/products`, body);
};

type UseAddProductOptions = {
  mutationConfig?: MutationConfig<typeof addProduct>;
};

export const useAddProduct = ({ mutationConfig }: UseAddProductOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: addProduct,
  });
};
