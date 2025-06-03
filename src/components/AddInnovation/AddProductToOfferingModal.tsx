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
import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query"; // Added for data fetching and query client
import { getBrands } from "@/api/get-brands";
import { getBrandPillars } from "@/api/get-brandPillars";
import { getMarkets } from "@/api/listManagement/markets/get-markets";
import { getSegments } from "@/api/listManagement/segments/get-segments";
import { getCategories } from "@/api/listManagement/coreCategories/get-categories";
import { getSubcategories } from "@/api/listManagement/subCategories/get-subcategories";
import { getCountries } from "@/api/get-countries";
import { getProducts } from "@/api/products/get-products";
import { getProductDistributors } from "@/api/products/get-product-distributors";
import { useEffect, useRef } from "react";
import { DateInput } from "@mantine/dates";
import {
  useCreateOfferingProduct,
  CreateOfferingProductDTO,
} from "@/api/innovations/offerings/products/create-product";
import { useUpdateOfferingProduct } from "@/api/innovations/offerings/products/update-product";
import { Product } from "@/types";

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
  line_id: string | number | undefined;
  article_type: string;
  offering_number: string | number | undefined;
  launch_date: Date | null;
  discontinue_date: Date | null;
  category_id: string;
  subcategory_id: string;
  market_id: string;
  segment_id: string;
  icp_eur: string | number | undefined;
  icp_usd: string | number | undefined;
  factory: string | number | undefined;
  commodity_id: string;
  country_id: string;
  gender: string;
  size: string;
  length: string | number | undefined;
  height: string | number | undefined;
  width: string | number | undefined;
  volume: string | number | undefined;
  gross_weight: string | number | undefined;
  net_weight: string | number | undefined;
  units: string | number | undefined;
  price?: number; // Add price field to match API expectations
}

interface AddProductToOfferingModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (product: OfferingProductFormValues) => void;
  innovationId: string;
  offeringId: string;
  editMode?: boolean;
  initialData?: Product;
}

// Updated Zod schema for validation
const productSchema = z.object({
  irc: z.string().min(1, "IRC Number is required"),
  material_description: z.string().optional(),
  icp_cost: z.union([z.number(), z.string()]).transform((val) => {
    if (typeof val === "string" && val === "") return 0;
    return Number(val);
  }),
  currency: z.enum(["EUR", "USD"]),
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
  line_id: z.union([z.number(), z.string()]).optional(),
  article_type: z.string().optional(),
  offering_number: z.union([z.number(), z.string()]).optional(),
  launch_date: z.date().nullable().optional(),
  discontinue_date: z.date().nullable().optional(),
  category_id: z.string().optional(),
  subcategory_id: z.string().optional(),
  market_id: z.string().optional(),
  segment_id: z.string().optional(),
  icp_eur: z.union([z.number(), z.string()]).optional(),
  icp_usd: z.union([z.number(), z.string()]).optional(),
  factory: z.union([z.number(), z.string()]).optional(),
  commodity_id: z.string().optional(),
  country_id: z.string().optional(),
  gender: z.string().optional(),
  size: z.string().optional(),
  length: z.union([z.number(), z.string()]).optional(),
  height: z.union([z.number(), z.string()]).optional(),
  width: z.union([z.number(), z.string()]).optional(),
  volume: z.union([z.number(), z.string()]).optional(),
  gross_weight: z.union([z.number(), z.string()]).optional(),
  net_weight: z.union([z.number(), z.string()]).optional(),
  units: z.union([z.number(), z.string()]).optional(),
});

export function AddProductToOfferingModal({
  opened,
  onClose,
  onSubmit,
  innovationId,
  offeringId,
  editMode = false,
  initialData,
}: AddProductToOfferingModalProps) {
  const queryClient = useQueryClient();

  const form = useForm<OfferingProductFormValues>({
    initialValues:
      editMode && initialData
        ? {
            irc: initialData.irc || "",
            material_description: initialData.material_description || "",
            icp_cost: (initialData as any).currency === "USD" 
              ? Number(initialData.icp_usd) || 0 
              : Number(initialData.icp_eur) || 0,
            currency: (initialData as any).currency || "USD",
            brand_id:
              initialData.brand?.id && initialData.brand.id !== 0
                ? initialData.brand.id.toString()
                : "",
            sub_brand_id:
              initialData.brand_pillar?.id && initialData.brand_pillar.id !== 0
                ? initialData.brand_pillar.id.toString()
                : "",
            product_type:
              (initialData.product_type as "saleable" | "non-saleable") ||
              "saleable",
            pref: (initialData.pref as "pref" | "non-pref") || "pref",
            grouping:
              (initialData.grouping?.toString() as "1" | "2" | "3") || "1",
            division: initialData.division || "",
            brand_category: (initialData as any).brand_category || "",
            ean_upc: initialData.ean_upc || "",
            house: initialData.house || "",
            line: initialData.line || "",
            line_id: initialData.line_id || "",
            article_type: initialData.article_type || "",
            offering_number: initialData.offering_number+ "" || "",
            launch_date: initialData.launch_date
              ? new Date(initialData.launch_date)
              : null,
            discontinue_date: initialData.discontinue_date
              ? new Date(initialData.discontinue_date)
              : null,
            category_id:
              initialData.category?.id && initialData.category.id !== 0
                ? initialData.category.id.toString()
                : "",
            subcategory_id:
              initialData.subcategory?.id && initialData.subcategory.id !== 0
                ? initialData.subcategory.id.toString()
                : "",
            market_id:
              initialData.market?.id && initialData.market.id !== 0
                ? initialData.market.id.toString()
                : "",
            segment_id:
              initialData.segment?.id && initialData.segment.id !== 0
                ? initialData.segment.id.toString()
                : "",
            icp_eur: initialData.icp_eur || "",
            icp_usd: initialData.icp_usd || "",
            factory: initialData.factory || "",
            commodity_id: initialData.commodity_id || "",
            country_id:
              initialData.country?.id && initialData.country.id !== 0
                ? initialData.country.id.toString()
                : "",
            gender: initialData.gender || "",
            size: initialData.size || "",
            length: initialData.length || "",
            height: initialData.height || "",
            width: initialData.width || "",
            volume: initialData.volume || "",
            gross_weight: initialData.gross_weight || "",
            net_weight: initialData.net_weight || "",
            units: initialData.units || "",
            price:
              Number(initialData.icp_eur) || Number(initialData.icp_usd) || 0,
          }
        : {
            irc: "",
            material_description: "",
            icp_cost: "",
            currency: "USD",
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
            price: undefined,
          },
    validate: zodResolver(productSchema),
  });

  // Add a useEffect hook to ensure form fields are properly populated in edit mode
  // Using a ref to track if we've already initialized the form to prevent continuous resets
  const formInitializedRef = useRef(false);
  
  useEffect(() => {
    // Only set form values once when the modal is first opened in edit mode
    if (editMode && initialData && opened && !formInitializedRef.current) {
      console.log("Edit mode initialData:", initialData);
      formInitializedRef.current = true;
      
      // Force update form values to ensure all fields are properly populated
      // This is especially important for fields like EAN/UPC that might not be updating correctly
      form.setValues({
        irc: initialData.irc || "",
        material_description: initialData.material_description || "",
        icp_cost: Number(initialData.icp_eur) || Number(initialData.icp_usd) || 0,
        currency: ((initialData as any).currency === "EUR" ? "EUR" : "USD") as "EUR" | "USD",
        brand_id: initialData.brand?.id && initialData.brand.id !== 0 ? initialData.brand.id.toString() : "",
        sub_brand_id: initialData.brand_pillar?.id && initialData.brand_pillar.id !== 0 ? initialData.brand_pillar.id.toString() : "",
        product_type: (initialData.product_type as "saleable" | "non-saleable") || "saleable",
        pref: (initialData.pref as "pref" | "non-pref") || "pref",
        grouping: (initialData.grouping?.toString() as "1" | "2" | "3") || "1",
        division: initialData.division || "",
        brand_category: "", // Brand category is not in the Product type
        ean_upc: initialData.ean_upc || "",
        house: initialData.house || "",
        line: initialData.line || "",
        line_id: initialData.line_id || "",
        article_type: initialData.article_type || "",
        offering_number: initialData.offering_number + "" || "",
        launch_date: initialData.launch_date ? new Date(initialData.launch_date) : null,
        discontinue_date: initialData.discontinue_date ? new Date(initialData.discontinue_date) : null,
        category_id: initialData.category?.id && initialData.category.id !== 0 ? initialData.category.id.toString() : "",
        subcategory_id: initialData.subcategory?.id && initialData.subcategory.id !== 0 ? initialData.subcategory.id.toString() : "",
        market_id: initialData.market?.id && initialData.market.id !== 0 ? initialData.market.id.toString() : "",
        segment_id: initialData.segment?.id && initialData.segment.id !== 0 ? initialData.segment.id.toString() : "",
        icp_eur: initialData.icp_eur || "",
        icp_usd: initialData.icp_usd || "",
        factory: initialData.factory || "",
        commodity_id: initialData.commodity_id || "",
        country_id: initialData.country?.id && initialData.country.id !== 0 ? initialData.country.id.toString() : "",
        gender: initialData.gender || "",
        size: initialData.size || "",
        length: initialData.length || "",
        height: initialData.height || "",
        width: initialData.width || "",
        volume: initialData.volume || "",
        gross_weight: initialData.gross_weight || "",
        net_weight: initialData.net_weight || "",
        units: initialData.units || "",
        price: Number(initialData.icp_eur) || Number(initialData.icp_usd) || 0,
      });
    }
    
    // Reset the ref when the modal is closed so it will initialize again when reopened
    if (!opened) {
      formInitializedRef.current = false;
    }
  }, [editMode, initialData, form, opened]);

  const selectedBrandId = form.values.brand_id;
  const selectedCategoryId = form.values.category_id;
  const selectedGmmCategoryId = form.values.category_id; // Using the same category for GMM as well

  // Implement the useQueries hook to fetch all necessary data
  const [
    { data: marketsData, isLoading: marketsLoading },
    { data: segmentsData, isLoading: segmentsLoading },
    { data: categoriesData, isLoading: categoriesLoading },
    { data: subCategoriesData, isLoading: subCategoriesLoading },
    { data: gmmSubCategoriesData, isLoading: gmmSubCategoriesLoading },
    { data: brandsData, isLoading: brandsLoading },
    { data: countriesData, isLoading: countriesLoading },
    { data: brandPillarsData, isLoading: brandPillarsLoading },
    { data: productsListData, isLoading: productsLoading },
    { data: productDistributorsData, isLoading: productDistributorsLoading },
  ] = useQueries({
    queries: [
      {
        queryKey: ["markets"],
        queryFn: () => getMarkets({ page_size: 999999, type: "core" }),
      },
      {
        queryKey: ["segments"],
        queryFn: () => getSegments({ page_size: 999999 }),
      },
      {
        queryKey: ["categories"],
        queryFn: () => getCategories({ type: "core", page_size: 999999 }),
      },
      {
        queryKey: ["subCategories", selectedCategoryId],
        queryFn: () =>
          getSubcategories({
            filter: {
              category_id: selectedCategoryId,
            },
            page_size: 99999,
            type: "core",
          }),
        enabled: !!selectedCategoryId,
      },
      {
        queryKey: ["GmmSubCategories", selectedGmmCategoryId],
        queryFn: () =>
          getSubcategories({
            filter: {
              category_id: selectedGmmCategoryId,
            },
            page_size: 99999,
            type: "core",
          }),
        enabled: !!selectedGmmCategoryId,
      },
      { queryKey: ["brands"], queryFn: () => getBrands() },
      { queryKey: ["countries"], queryFn: getCountries },
      {
        queryKey: ["brand_pillars", selectedBrandId],
        queryFn: () =>
          getBrandPillars({
            filter: {
              brand_id: selectedBrandId,
            },
          }),
        enabled: !!selectedBrandId,
      },
      {
        queryKey: ["products"],
        queryFn: () => getProducts({ cursor: 1, page_size: 100 }),
      },
      {
        queryKey: ["product-distributor", selectedBrandId, form.values.pref],
        queryFn: () =>
          getProductDistributors(
            selectedBrandId,
            form.values.pref
          ),
        enabled: !!selectedBrandId && !!form.values.pref,
      },
    ],
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
      onSuccess: async (data, variables) => {

        queryClient.setQueryData(
          ["innovations", innovationId.toString(), "offerings", offeringId.toString(), "products"],
          (oldData: any) => {
            if (!oldData) return { data: [data.data] };
            
            return {
              ...oldData,
              data: [...oldData.data, data.data],
            };
          }
        );
        
        // Also update the offering-products cache
        queryClient.setQueryData(
          ["offering-products", innovationId, offeringId],
          (oldData: any) => {
            if (!oldData) return [data.data];
            return [...oldData, data.data];
          }
        );
        
        // Invalidate related queries
        await invalidateQueries();
        await onSubmit(form.values);
        form.reset();
        onClose();
      },
      onError: (error) => {
        console.error("Failed to create product:", error);
      },
    },
  });

  const updateProductMutation = useUpdateOfferingProduct({
    mutationConfig: {
      onSuccess: async (data, variables) => {
        
        queryClient.setQueryData(
          ["innovations", innovationId.toString(), "offerings", offeringId.toString(), "products"],
          (oldData: any) => {
            if (!oldData) return oldData;
            
            const updatedProducts = oldData.data.map((product: any) => {
              if (product.id === variables.id) {
                return { ...product, ...variables.data };
              }
              return product;
            });
            
            return {
              ...oldData,
              data: updatedProducts,
            };
          }
        );
        
        queryClient.setQueryData(
          ["offering-products", innovationId, offeringId],
          (oldData: any) => {
            if (!oldData) return oldData;
            
            const updatedProducts = oldData.map((product: any) => {
              if (product.id === variables.id) {
                return { ...product, ...variables.data };
              }
              return product;
            });
            
            return updatedProducts;
          }
        );
        
        await invalidateQueries();
        await onSubmit(form.values);
        form.reset();
        onClose();
      },
      onError: (error) => {
        console.error("Failed to update product:", error);
      },
    },
  });

  const invalidateQueries = async () => {
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
  };

  function formatDateToMySQL(
    date: Date | null | undefined
  ): string | undefined {
    if (!date) return undefined;
    // Only date part: YYYY-MM-DD
    return date.toISOString().slice(0, 10);
  }

  const handleSubmit = (values: OfferingProductFormValues) => {
    const validation = form.validate();
    if (validation.hasErrors) {
      console.error("Form validation errors:", validation.errors);
      return;
    }

    // Ensure icp_cost is a number
    const icp_cost = Number(values.icp_cost);
    if (isNaN(icp_cost)) {
      form.setFieldError("icp_cost", "ICP Cost must be a valid number");
      return;
    }

    // Prepare submission values with proper handling of all fields
    const submissionValues = {
      irc: values.irc.trim(),
      material_description: values.material_description?.trim() || "",
      icp_cost: icp_cost,
      price: icp_cost,
      currency: values.currency,
      brand_id: values.brand_id === "0" ? "" : values.brand_id || "",
      sub_brand_id: values.sub_brand_id === "0" ? "" : values.sub_brand_id || "",
      product_type: values.product_type,
      pref: values.pref,
      grouping: values.grouping,
      division: values.division || "",
      brand_category: values.brand_category || "",
      ean_upc: values.ean_upc || "",
      house: values.house || "",
      line: values.line || "",
      line_id: values.line_id === "" ? undefined : values.line_id,
      article_type: values.article_type || "",
      offering_number: values.offering_number === "" ? undefined : values.offering_number + "",
      launch_date: values.launch_date
        ? values.launch_date.toISOString().split("T")[0]
        : undefined,
      discontinue_date: values.discontinue_date
        ? values.discontinue_date.toISOString().split("T")[0]
        : undefined,
      category_id: values.category_id === "0" ? "" : values.category_id || "",
      subcategory_id: values.subcategory_id === "0" ? "" : values.subcategory_id || "",
      market_id: values.market_id === "0" ? "" : values.market_id || "",
      segment_id: values.segment_id === "0" ? "" : values.segment_id || "",
      factory: values.factory === "" ? undefined : values.factory,
      commodity_id: values.commodity_id || "",
      country_id: values.country_id === "0" ? "" : values.country_id || "",
      gender: values.gender || "",
      size: values.size || "",
      length: values.length === "" ? undefined : values.length,
      height: values.height === "" ? undefined : values.height,
      width: values.width === "" ? undefined : values.width,
      volume: values.volume === "" ? undefined : values.volume,
      gross_weight: values.gross_weight === "" ? undefined : values.gross_weight,
      net_weight: values.net_weight === "" ? undefined : values.net_weight,
      units: values.units === "" ? undefined : values.units,
      icp_eur: values.currency === "EUR" ? icp_cost : undefined,
      icp_usd: values.currency === "USD" ? icp_cost : undefined,
    };

    console.log("submissionValues for update/create:", submissionValues);

    if (editMode && initialData) {
      updateProductMutation.mutate({
        innovationId,
        offeringId,
        id: initialData.id,
        data: submissionValues
      });
    } else {
      createProductMutation.mutate({
        innovationId,
        offeringId,
        data: submissionValues as CreateOfferingProductDTO
      });
    }
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
              {editMode ? "Edit Product" : "Add New Product"}
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
                    data={
                      categoriesData?.data
                        ? categoriesData.data.map((category) => ({
                            value: category.id.toString(),
                            label: category.name,
                          }))
                        : []
                    }
                    {...form.getInputProps("category_id")}
                    classNames={selectStyles}
                    disabled={categoriesLoading}
                    rightSection={categoriesLoading ? <Loader size="xs" /> : null}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    name="subcategory_id"
                    label="Sub Category"
                    placeholder="Select Sub Category"
                    data={
                      subCategoriesData?.data
                        ? subCategoriesData.data.map((subcategory) => ({
                            value: subcategory.id.toString(),
                            label: subcategory.name,
                          }))
                        : []
                    }
                    {...form.getInputProps("subcategory_id")}
                    classNames={selectStyles}
                    disabled={subCategoriesLoading || !form.values.category_id}
                    rightSection={subCategoriesLoading ? <Loader size="xs" /> : null}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    name="market_id"
                    label="Market"
                    placeholder="Select Market"
                    data={
                      marketsData?.data
                        ? marketsData.data.map((market) => ({
                            value: market.id.toString(),
                            label: market.name,
                          }))
                        : []
                    }
                    {...form.getInputProps("market_id")}
                    classNames={selectStyles}
                    disabled={marketsLoading}
                    rightSection={marketsLoading ? <Loader size="xs" /> : null}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    name="segment_id"
                    label="Segment"
                    placeholder="Select Segment"
                    data={
                      segmentsData?.data
                        ? segmentsData.data.map((segment) => ({
                            value: segment.id.toString(),
                            label: segment.name,
                          }))
                        : []
                    }
                    {...form.getInputProps("segment_id")}
                    classNames={selectStyles}
                    disabled={segmentsLoading}
                    rightSection={segmentsLoading ? <Loader size="xs" /> : null}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Factory"
                    placeholder="Enter Factory"
                    {...form.getInputProps("factory")}
                    classNames={textInputStyles}
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
                    data={
                      countriesData?.data
                        ? countriesData.data.map((country) => ({
                            value: country.id.toString(),
                            label: country.name,
                          }))
                        : []
                    }
                    {...form.getInputProps("country_id")}
                    classNames={selectStyles}
                    disabled={countriesLoading}
                    rightSection={countriesLoading ? <Loader size="xs" /> : null}
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
                  disabled={
                    createProductMutation.isPending ||
                    updateProductMutation.isPending
                  }
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={
                    createProductMutation.isPending ||
                    updateProductMutation.isPending
                  }
                  variant="filled"
                  className="bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-primary/90 transition-all ease-in-out duration-300"
                  onClick={() => {
                    console.log("Update/Add button clicked");
                    handleSubmit(form.values);
                  }}
                >
                  {createProductMutation.isPending ||
                  updateProductMutation.isPending
                    ? editMode
                      ? "Updating..."
                      : "Adding..."
                    : editMode
                      ? "Update Product"
                      : "Add Product"}
                </Button>
              </Group>
            </div>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
