import {
  Button,
  Grid,
  Modal,
  NumberInput,
  Select,
  TextInput,
  Group,
  Radio,
  Loader,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";
import { selectStyles, textInputStyles } from "../Shared/Styles";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Added for data fetching and query client
import { getBrands } from "@/api/get-brands"; // Assuming API path
import { getBrandPillars } from "@/api/get-brandPillars"; // Assuming API path
import { useEffect } from "react";
import { DateInput } from "@mantine/dates";
import { useCreateOfferingProduct } from "@/api/innovations/offerings/products/create-product";

// Updated interface for the product details in the modal
export interface OfferingProductFormValues {
  irc: string;
  material_description?: string;
  icp_cost: number | ""; // Allow empty string for NumberInput behavior
  currency: "EUR" | "USD";
  brand_id: string;
  sub_brand_id?: string;
  product_type: "saleable" | "non-saleable";
  pref: "pref" | "non-pref";
  grouping: "1" | "2" | "3";
  division: string;
  brand_category: string;
  ean_upc: string;
  house: string;
  line: string;
  line_id: number | "" | undefined;
  article_type: string;
  offering_number: number | "" | undefined;
  launch_date: Date | null;
  discontinue_date: Date | null;
  category_id: string;
  subcategory_id: string;
  market_id: string;
  segment_id: string;
  icp_eur: number | "" | undefined;
  icp_usd: number | "" | undefined;
  factory: number | "" | undefined;
  commodity_id: string;
  country_id: string;
  gender: string;
  size: string;
  length: number | "" | undefined;
  height: number | "" | undefined;
  width: number | "" | undefined;
  volume: number | "" | undefined;
  gross_weight: number | "" | undefined;
  net_weight: number | "" | undefined;
  units: number | "" | undefined;
}

export interface AddProductToOfferingModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (
    product: Omit<OfferingProductFormValues, "icp_cost"> & { icp_cost: number }
  ) => void;
  isLoading?: boolean;
  innovationId: string;
  offeringId: string;
}

// Updated Zod schema for validation
const productSchema = z.object({
  irc: z.string().min(1, "IRC Number is required"),
  material_description: z.string().optional(),
  icp_cost: z
    .number({ required_error: "ICP Cost is required" })
    .min(0, "ICP Cost must be a positive number"),
  currency: z.enum(["EUR", "USD"], { required_error: "Currency is required" }),
  brand_id: z.string().optional(),
  sub_brand_id: z.string().optional(),
  product_type: z.enum(["saleable", "non-saleable"]).optional(),
  pref: z.enum(["pref", "non-pref"]).optional(),
  grouping: z.enum(["1", "2", "3"]).optional(),
  division: z.string().optional(),
  brand_category: z.string().optional(),
  ean_upc: z.string().optional(),
  house: z.string().optional(),
  line: z.string().optional(),
  line_id: z.number().min(0, "Line ID must be a positive number").optional(),
  article_type: z.string().optional(),
  offering_number: z
    .number()
    .min(0, "Offering Number must be a positive number")
    .optional(),
  launch_date: z.date().nullable().optional(),
  discontinue_date: z.date().nullable().optional(),
  category_id: z.string().optional(),
  subcategory_id: z.string().optional(),
  market_id: z.string().optional(),
  segment_id: z.string().optional(),
  icp_eur: z.number().min(0, "ICP EUR must be a positive number").optional(),
  icp_usd: z.number().min(0, "ICP USD must be a positive number").optional(),
  factory: z.number().min(0, "Factory must be a positive number").optional(),
  commodity_id: z.string().optional(),
  country_id: z.string().optional(),
  gender: z.string().optional(),
  size: z.string().optional(),
  length: z.number().min(0, "Length must be a positive number").optional(),
  height: z.number().min(0, "Height must be a positive number").optional(),
  width: z.number().min(0, "Width must be a positive number").optional(),
  volume: z.number().min(0, "Volume must be a positive number").optional(),
  gross_weight: z
    .number()
    .min(0, "Gross Weight must be a positive number")
    .optional(),
  net_weight: z
    .number()
    .min(0, "Net Weight must be a positive number")
    .optional(),
  units: z.number().min(0, "Units must be a positive number").optional(),
});

export const AddProductToOfferingModal: React.FC<
  AddProductToOfferingModalProps
> = ({
  opened,
  onClose,
  onSubmit,
  isLoading = false,
  innovationId,
  offeringId,
}) => {
  const queryClient = useQueryClient();

  const form = useForm<OfferingProductFormValues>({
    initialValues: {
      irc: "",
      material_description: "",
      icp_cost: "",
      currency: "EUR",
      brand_id: "",
      sub_brand_id: "",
      product_type: "saleable",
      pref: "pref",
      grouping: "1",
      division: "",
      brand_category: "",
      ean_upc: "",
      house: "",
      line: "",
      line_id: undefined,
      article_type: "",
      offering_number: undefined,
      launch_date: null,
      discontinue_date: null,
      category_id: "",
      subcategory_id: "",
      market_id: "",
      segment_id: "",
      icp_eur: undefined,
      icp_usd: undefined,
      factory: undefined,
      commodity_id: "",
      country_id: "",
      gender: "",
      size: "",
      length: undefined,
      height: undefined,
      width: undefined,
      volume: undefined,
      gross_weight: undefined,
      net_weight: undefined,
      units: undefined,
    },
    validate: zodResolver(productSchema),
  });

  const selectedBrandId = form.values.brand_id;

  const { data: brandsData, isLoading: brandsLoading } = useQuery<
    { data: Array<{ id: number; name: string }> }, // Assuming this is the shape of getBrands response
    Error
  >({
    queryKey: ["brands"],
    queryFn: () => getBrands(), // Wrapped in arrow function
  });

  const { data: brandPillarsData, isLoading: brandPillarsLoading } = useQuery<
    { data: Array<{ id: number; name: string }> }, // Assuming this is the shape for brand pillars
    Error
  >({
    queryKey: ["brand_pillars", selectedBrandId],
    queryFn: () => getBrandPillars({ filter: { brand_id: selectedBrandId } }), // Wrapped
    enabled: !!selectedBrandId,
  });

  // Reset sub_brand_id when brand_id changes
  useEffect(() => {
    if (selectedBrandId && form.values.sub_brand_id) {
      // Check if current sub_brand_id still belongs to the new brand_id
      const currentPillarIsValid = brandPillarsData?.data?.some(
        (p) => p.id.toString() === form.values.sub_brand_id
      );
      if (!currentPillarIsValid && !brandPillarsLoading) {
        form.setFieldValue("sub_brand_id", "");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrandId, brandPillarsData, brandPillarsLoading]); // form instance is stable

  const createProductMutation = useCreateOfferingProduct({
    mutationConfig: {
      onSuccess: async (data) => {
        // Invalidate relevant queries to trigger a refresh
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["offering-products", innovationId, offeringId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["innovations", innovationId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["offerings", offeringId],
          }),
        ]);

        // Call the parent onSubmit to update local state if needed
        await onSubmit({
          ...form.values,
          icp_cost: Number(form.values.icp_cost),
        });

        // Reset form and close modal
        form.reset();
        onClose();
      },
      onError: (error) => {
        console.error("Failed to create product:", error);
      },
    },
  });

  const handleSubmit = (values: OfferingProductFormValues) => {
    const validation = form.validate();
    if (validation.hasErrors) {
      return;
    }

    // Ensure icp_cost is a number
    const icp_cost = Number(values.icp_cost);
    if (isNaN(icp_cost)) {
      form.setFieldError("icp_cost", "ICP Cost must be a valid number");
      return;
    }

    // Create the submission object with required fields
    const submissionValues = {
      irc: values.irc.trim(),
      material_description: values.material_description?.trim(),
      icp_cost,
      price: icp_cost,
      currency: values.currency as "EUR" | "USD",
      brand_id: values.brand_id || "",
      sub_brand_id: values.sub_brand_id,
      product_type: values.product_type || "saleable",
      pref: values.pref || "pref",
      grouping: values.grouping || "1",
    };

    // Call the create product mutation
    createProductMutation.mutate({
      innovationId,
      offeringId,
      data: submissionValues,
    });
  };

  return (
    <Modal.Root
      opened={opened}
      onClose={() => {
        form.reset();
        onClose();
      }}
      withinPortal={false}
      trapFocus={false}
      className={opened ? "absolute top-0 left-0 h-full w-full" : "hidden"}
    >
      <Modal.Overlay
        bg="linear-gradient(180deg, rgba(0, 37, 84, 0.7) 0%, rgba(0, 235, 178, 0.7) 100%)"
        blur={3}
      />
      {/* Updated Modal.Content styling */}
      <Modal.Content className="h-full min-w-[70%]">
        <Modal.Body>
          <div className="bg-white rounded-b-2xl px-6 py-6 space-y-6">
            <h2 className="text-xl font-semibold mb-6 text-primary">
              Add Product to Offering
            </h2>
            <div>
              <Grid gutter={{ sm: 20, base: 16 }}>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="IRC Number"
                    placeholder="Enter IRC Number"
                    required
                    {...form.getInputProps("irc")}
                    classNames={textInputStyles}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Material Description"
                    placeholder="Enter material description"
                    {...form.getInputProps("material_description")}
                    classNames={textInputStyles}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <NumberInput
                    label="ICP Cost"
                    placeholder="Enter ICP Cost"
                    required
                    min={0}
                    decimalScale={2}
                    {...form.getInputProps("icp_cost")}
                    classNames={textInputStyles}
                    hideControls
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 2 }}>
                  <Select
                    name="currency"
                    label="Currency"
                    placeholder="Select currency"
                    required
                    data={[
                      { value: "EUR", label: "EUR" },
                      { value: "USD", label: "USD" },
                    ]}
                    {...form.getInputProps("currency")}
                    classNames={selectStyles}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    name="division"
                    label="Division"
                    placeholder="Select division"
                    data={[
                      { value: "mass", label: "Mass" },
                      { value: "luxury", label: "Luxury" },
                    ]}
                    {...form.getInputProps("division")}
                    classNames={selectStyles}
                    clearable
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    name="brand_category"
                    label="Brand Category"
                    placeholder="Select brand category"
                    data={[
                      { value: "formal", label: "Formal" },
                      { value: "informal", label: "Informal" },
                    ]}
                    {...form.getInputProps("brand_category")}
                    classNames={selectStyles}
                    clearable
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="EAN/UPC"
                    placeholder="Enter EAN/UPC"
                    {...form.getInputProps("ean_upc")}
                    classNames={textInputStyles}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="House"
                    placeholder="Enter House"
                    {...form.getInputProps("house")}
                    classNames={textInputStyles}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Line"
                    placeholder="Enter Line"
                    {...form.getInputProps("line")}
                    classNames={textInputStyles}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label="Line ID"
                    placeholder="Enter Line ID"
                    {...form.getInputProps("line_id")}
                    classNames={textInputStyles}
                    hideControls
                    allowDecimal={false}
                    allowNegative={false}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Article Type"
                    placeholder="Enter Article Type"
                    {...form.getInputProps("article_type")}
                    classNames={textInputStyles}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label="Offering Number (optional)"
                    placeholder="Enter Offering Number"
                    {...form.getInputProps("offering_number")}
                    classNames={textInputStyles}
                    hideControls
                    allowDecimal={false}
                    allowNegative={false}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <DateInput
                    label="Launch Date"
                    placeholder="Select Launch Date"
                    {...form.getInputProps("launch_date")}
                    classNames={textInputStyles}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <DateInput
                    label="Discontinue Date"
                    placeholder="Select Discontinue Date"
                    {...form.getInputProps("discontinue_date")}
                    classNames={textInputStyles}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    name="category_id"
                    label="Core Category"
                    placeholder="Select Core Category"
                    data={[] /* TODO: fetch categories */}
                    {...form.getInputProps("category_id")}
                    classNames={selectStyles}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    name="subcategory_id"
                    label="Sub Category"
                    placeholder="Select Sub Category"
                    data={[] /* TODO: fetch subcategories */}
                    {...form.getInputProps("subcategory_id")}
                    classNames={selectStyles}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    name="market_id"
                    label="Market"
                    placeholder="Select Market"
                    data={[] /* TODO: fetch markets */}
                    {...form.getInputProps("market_id")}
                    classNames={selectStyles}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    name="segment_id"
                    label="Segment"
                    placeholder="Select Segment"
                    data={[] /* TODO: fetch segments */}
                    {...form.getInputProps("segment_id")}
                    classNames={selectStyles}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label="Factory"
                    placeholder="Enter Factory"
                    {...form.getInputProps("factory")}
                    classNames={textInputStyles}
                    hideControls
                    allowDecimal={false}
                    allowNegative={false}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Commodity ID"
                    placeholder="Enter Commodity ID"
                    {...form.getInputProps("commodity_id")}
                    classNames={textInputStyles}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    name="country_id"
                    label="Country of Origin"
                    placeholder="Select Country"
                    data={[] /* TODO: fetch countries */}
                    {...form.getInputProps("country_id")}
                    classNames={selectStyles}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    name="gender"
                    label="Gender"
                    placeholder="Select Gender"
                    data={[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                    ]}
                    {...form.getInputProps("gender")}
                    classNames={selectStyles}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Size & Dimension"
                    placeholder="Enter Size & Dimension"
                    {...form.getInputProps("size")}
                    classNames={textInputStyles}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label="Length"
                    placeholder="Enter Length"
                    {...form.getInputProps("length")}
                    classNames={textInputStyles}
                    allowDecimal={false}
                    allowNegative={false}
                    hideControls
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label="Height"
                    placeholder="Enter Height"
                    {...form.getInputProps("height")}
                    classNames={textInputStyles}
                    allowDecimal={false}
                    allowNegative={false}
                    hideControls
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label="Width"
                    placeholder="Enter Width"
                    {...form.getInputProps("width")}
                    classNames={textInputStyles}
                    allowDecimal={false}
                    allowNegative={false}
                    hideControls
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label="Volume"
                    placeholder="Enter Volume"
                    {...form.getInputProps("volume")}
                    classNames={textInputStyles}
                    allowDecimal={false}
                    allowNegative={false}
                    hideControls
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label="Gross Weight"
                    placeholder="Enter Gross Weight"
                    {...form.getInputProps("gross_weight")}
                    classNames={textInputStyles}
                    allowDecimal={false}
                    allowNegative={false}
                    hideControls
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label="Net Weight"
                    placeholder="Enter Net Weight"
                    {...form.getInputProps("net_weight")}
                    classNames={textInputStyles}
                    allowDecimal={false}
                    allowNegative={false}
                    hideControls
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label="Units"
                    placeholder="Enter Units"
                    {...form.getInputProps("units")}
                    classNames={textInputStyles}
                    allowDecimal={false}
                    allowNegative={false}
                    hideControls
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    name="brand_id"
                    label="Brand"
                    placeholder="Select brand"
                    data={
                      brandsData?.data?.map(
                        (brand: { id: number; name: string }) => ({
                          value: brand.id.toString(),
                          label: brand.name,
                        })
                      ) || []
                    }
                    {...form.getInputProps("brand_id")}
                    classNames={selectStyles}
                    disabled={brandsLoading}
                    searchable
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    name="sub_brand_id"
                    label="Brand Pillar (Sub Brand)"
                    placeholder="Select brand pillar"
                    data={
                      brandPillarsData?.data?.map(
                        (pillar: { id: number; name: string }) => ({
                          value: pillar.id.toString(),
                          label: pillar.name,
                        })
                      ) || []
                    }
                    {...form.getInputProps("sub_brand_id")}
                    classNames={selectStyles}
                    disabled={brandPillarsLoading || !selectedBrandId}
                    searchable
                    clearable
                  />
                </Grid.Col>
              </Grid>

              {(brandsLoading || (brandPillarsLoading && selectedBrandId)) && (
                <Loader />
              )}

              <Group justify="flex-end" mt="xl" gap={10}>
                <Button
                  type="button"
                  variant="outline"
                  className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
                  onClick={() => {
                    form.reset();
                    onClose();
                  }}
                  disabled={isLoading || createProductMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={isLoading || createProductMutation.isPending}
                  variant="filled"
                  className="bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-primary/90 transition-all ease-in-out duration-300"
                  onClick={() => handleSubmit(form.values)}
                >
                  {isLoading || createProductMutation.isPending
                    ? "Adding..."
                    : "Add Product"}
                </Button>
              </Group>
            </div>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};
