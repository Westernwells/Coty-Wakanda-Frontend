import { getBrandPillars } from "@/api/get-brandPillars";
import { getBrands } from "@/api/get-brands";
import { getCountries } from "@/api/get-countries";
import { getHouses } from "@/api/get-houses";
import { getCategories } from "@/api/listManagement/coreCategories/get-categories";
import { getMarkets } from "@/api/listManagement/markets/get-markets";
import { getSegments } from "@/api/listManagement/segments/get-segments";
import { getSubcategories } from "@/api/listManagement/subCategories/get-subcategories";
import { useAddDocument } from "@/api/products/add-document";
import { addProductSchema, useAddProduct } from "@/api/products/add-product";
import { getProductDistributors } from "@/api/products/get-product-distributors";
import { getProducts } from "@/api/products/get-products";
import { useUpdateProduct } from "@/api/products/update-product";
import { queryClient } from "@/main";
import { Document, PriceBenchmark, Product, ProductInput } from "@/types";
import {
  Grid,
  Group,
  Loader,
  NumberInput,
  Radio,
  Select,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm, zodResolver } from "@mantine/form";
import { useQueries } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { toast } from "react-toastify";
import DateIcon from "../Icons/DateIcon";
import { FormField } from "../Shared/Form/Field";
import { FileUploadSection } from "../Shared/Form/FileUploadSection";
import { FormSection } from "../Shared/Form/Section";
import { selectStyles, textInputStyles } from "../Shared/Styles";
import { BrandTypeConfirmationModal } from "./brand-type-confirmation-modal";

const AddProductForm = forwardRef(function AddProductForm(
  {
    isEdit = false,
    product,
  }: {
    isEdit?: boolean;
    product?: Product;
  },
  ref
) {
  const navigate = useNavigate();
  const internalFormRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  let productToEdit;

  if (product) {
    const {
      brand,
      market,
      country,
      subcategory,
      category,
      brand_pillar,
      segment,
      gmm_category,
      gmm_market,
      gmm_segment,
      gmm_subCategory,
      ...flatProduct
    } = product;
    productToEdit = {
      ...flatProduct,
      brand_id: brand.id.toString(),
      market_id: market?.id?.toString(),
      segment_id: segment?.id?.toString(),
      country_id: country.id?.toString(),
      category_id: category?.id?.toString(),
      subcategory_id: subcategory?.id?.toString(),
      sub_brand_id: brand_pillar?.id?.toString(),
      gmm_category_id: gmm_category?.id?.toString(),
      gmm_market_id: gmm_market?.id?.toString(),
      gmm_segment_id: gmm_segment?.id?.toString(),
      gmm_subcategory_id: gmm_subCategory?.id?.toString(),
      launch_date: new Date(product.launch_date),
      discontinue_date: new Date(product.discontinue_date),
      grouping: product.grouping?.toString(),
      price_benchmark: {
        ...flatProduct.price_benchmark,
        brand_id: product.price_benchmark?.brand?.id.toString(),
        product_id: flatProduct.price_benchmark?.product?.id.toString(),
      },
    };
  }

  const initialDivision = useRef<string | undefined>(
    isEdit
      ? (productToEdit as unknown as { division?: string })?.division
      : undefined
  );
  const [showDivisionModal, setShowDivisionModal] = useState(false);
  const [pendingSubmitValues, setPendingSubmitValues] = useState<
    | (Partial<ProductInput> & { division?: string; brand_category?: string })
    | null
  >(null);

  useImperativeHandle(
    ref,
    () => ({
      submit: () => {
        internalFormRef.current?.requestSubmit();
      },
      isSubmitting,
    }),
    [isSubmitting]
  );

  const form = useForm<
    Partial<ProductInput> & { division?: string; brand_category: string, }
  >({
    mode: "uncontrolled",
    initialValues: isEdit
      ? {
          ...(productToEdit as object),
          division: product?.division ?? "",
          brand_category:
            (productToEdit as unknown as { brand_category?: string })
              ?.brand_category ?? "",
              brand_type: product?.division,
        }
      : {
          price_benchmark: {},
          distributor_pricing: [],
          division: "",
          brand_category: "",
        },
    validate: zodResolver(addProductSchema),
  });
  useEffect(() => {
   if(Number(product?.brand?.id) !== Number(form.getValues()?.brand_id)){
     form.setFieldValue("line", "");
   }

  }, [form, form.values.brand_id, product?.brand?.id]);
  const [
    { data: marketsData, isLoading: marketsLoading },
    { data: segmentsData, isLoading: segmentsLoading },
    { data: categoriesData, isLoading: categoriesLoading },
    { data: subCategoriesData, isLoading: subCategoriesLoading },
    { isLoading: gmmSubCategoriesLoading },
    { data: brandsData, isLoading: brandsLoading },
    { data: countriesData, isLoading: countriesLoading },
    // { data: currenciesData },
    { data:brandPillarsData, isLoading: brandPillarsLoading },
    { data: productsListData, isLoading: productsLoading },
    { data: productDistributorsData, isLoading: productDistrubutorsLoading },
    { data: housesData, error: housesError },

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
        queryKey: ["subCategories"],
        queryFn: () =>
          getSubcategories({
            filter: {
              category_id: form.getValues().category_id as string,
            },
            page_size: 99999,
            type: "core",
          }),
        enabled: !!form.getValues().category_id,
      },
      {
        queryKey: ["GmmSubCategories"],
        queryFn: () =>
          getSubcategories({
            filter: {
              category_id: form.getValues().gmm_category_id as string,
            },
            page_size: 99999,
            type: "core",
          }),
        enabled: !!form.getValues().category_id,
      },
      { queryKey: ["brands"], queryFn: () => getBrands() },
      { queryKey: ["countries"], queryFn: getCountries },
      // { queryKey: ["currencies"], queryFn: getCurrencies },
      {
        queryKey: ["brand_pillars"],
        queryFn: () =>
          getBrandPillars({
            filter: {
              brand_id: form.getValues().brand_id as string,
            },
          }),
        enabled: !!form.getValues().brand_id,
      },
      {
        queryKey: ["products"],
        queryFn: () => getProducts({ cursor: 1, page_size: 100 }),
      },
      {
        queryKey: ["product-distributor"],
        queryFn: () =>
          getProductDistributors(
            form.getValues().brand_id as string,
            form.getValues().pref as string
          ),
        enabled: !!form.getValues().brand_id && !!form.getValues().pref,
      },
      {
        queryKey: ["houses"],
        queryFn: () => getHouses(),
      },
    ],
  });

  const updateProduct = useUpdateProduct({
    mutationConfig: {
      onError: (error) => {
        toast.error(error.message);
      },
    },
  });

  const addProduct = useAddProduct({
    mutationConfig: {
      onError: (error) => {
        toast.error(error.message);
      },
    },
  });

  const addDocument = useAddDocument({
    mutationConfig: {
      onError: (error) => {
        toast.error(error.message);
      },
    },
  });

  form.watch("brand_id", () => {
    queryClient.invalidateQueries({
      queryKey: ["brand_pillars"],
      refetchType: "all",
    });
    queryClient.invalidateQueries({
      queryKey: ["product-distributor"],
      refetchType: "all",
    });
    
  });

  form.watch("pref", () => {
    queryClient.invalidateQueries({
      queryKey: ["product-distributor"],
      refetchType: "all",
    });
  });

  form.watch("category_id", () => {
    queryClient.invalidateQueries({
      queryKey: ["subCategories"],
      refetchType: "all",
    });
  });

  form.watch("gmm_category_id", () => {
    queryClient.invalidateQueries({
      queryKey: ["GmmSubCategories"],
      refetchType: "all",
    });
  });

  form.watch("division", ({ value }) => {
    if (form.getValues().brand_type !== value) {
      form.setFieldValue("brand_type", value);
    }
  });



  // …

  if (
    isEdit &&
    (brandsLoading ||
      segmentsLoading ||
      marketsLoading ||
      productsLoading ||
      countriesLoading ||
      categoriesLoading ||
      subCategoriesLoading ||
      brandPillarsLoading ||
      productDistrubutorsLoading ||
      gmmSubCategoriesLoading)
  )
    return <Loader />;

  return (
    <form
      ref={internalFormRef}
      onSubmit={form.onSubmit(async (values) => {
        if (isEdit && values.division !== initialDivision.current) {
          setPendingSubmitValues(values);
          setShowDivisionModal(true);
          return;
        }
        setIsSubmitting(true);
        try {
          const { documents, ...toSubmit } = values;
          const newDocuments = (documents as (Document & { id?: string })[])?.filter(
            (doc) => !doc.id
          );
      
          if (isEdit) {
            if (newDocuments?.length) {
              await Promise.all(
                newDocuments.map((doc: { title: string; url: string }) =>
                  addDocument.mutateAsync({
                    productId: product?.id || 0,
                    data: {
                      title: doc.title,
                      url: doc.url,
                    },
                  })
                )
              );
            }
      
            updateProduct.mutate(
              {
                data: {
                  ...toSubmit,
                  grouping: Number(values.grouping),
                  launch_date: values.launch_date?.toISOString().split("T")[0],
                  discontinue_date: values.discontinue_date
                    ?.toISOString()
                    .split("T")[0],
                  price_benchmark: (values.price_benchmark as PriceBenchmark) || null,
                  division: values.division,
                },
              },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({
                    queryKey: ["products"],
                    refetchType: "all",
                  });
                  navigate({ to: "/products" });
                },
                onSettled: () => setIsSubmitting(false),
              }
            );
          } else {
            addProduct.mutate(
              {
                data: {
                  ...toSubmit,
                  grouping: Number(values.grouping),
                  launch_date: values.launch_date?.toISOString().split("T")[0],
                  discontinue_date: values.discontinue_date
                    ?.toISOString()
                    .split("T")[0],
                  price_benchmark: (values.price_benchmark as PriceBenchmark) || null,
                  documents: documents,
                  division: values.division,
                },
              },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({
                    queryKey: ["products"],
                    refetchType: "all",
                  });
                  navigate({ to: "/products" });
                },
                onSettled: () => setIsSubmitting(false),
              }
            );
          }
        } catch {
          setIsSubmitting(false);
        }
      })}
    >
      <FormSection title="Product details" className="mt-2 sm:mt-5">
        <Grid gutter={24}>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <Select
              label="Division"
              placeholder="Select division"
              {...form.getInputProps("division")}
              data={[
                {
                  label: "Mass",
                  value: "mass",
                },
                {
                  label: "Luxury",
                  value: "luxury",
                },
              ]}
              classNames={selectStyles}
              clearable
            />
          </Grid.Col>
          {form.getValues().division && (
            <Grid.Col
              span={{
                sm: 6,
                base: 12,
              }}
            >
              <Select
                label="Category"
                placeholder="Select category"
                {...form.getInputProps("brand_category")}
                data={[
                  { value: "formal", label: "Formal" },
                  { value: "informal", label: "Informal" },
                ]}
                classNames={selectStyles}
                clearable
              />
            </Grid.Col>
          )}
        </Grid>
        <Radio.Group
          {...form.getInputProps("pref")}
          name="pref"
          label="Pref/non-pref"
          classNames={{
            label: "text-primary font-medium text-sm",
          }}
        >
          <Group w="100%" className="mt-[10px] " gap={24}>
            <Radio
              value="pref"
              label="Pref"
              classNames={{
                label: "text-primary text-sm pl-[5px] sm:pl-2",
              }}
            />
            <Radio
              value="non-pref"
              label="Non-pref"
              classNames={{
                label: "text-primary text-sm pl-[5px] sm:pl-2",
              }}
            />
          </Group>
        </Radio.Group>

        <Grid>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <FormField label="Grouping">
              <Radio.Group {...form.getInputProps("grouping")} name="grouping">
                <Group gap={24} w="100%" className="mt-[10px]">
                  <Radio
                    value={"1"}
                    label="Group 1"
                    classNames={{
                      label: "text-primary text-sm pl-[5px] sm:pl-2",
                    }}
                  />
                  <Radio
                    value={"2"}
                    label="Group 2"
                    classNames={{
                      label: "text-primary text-sm pl-[5px] sm:pl-2",
                    }}
                  />
                  <Radio
                    value={"3"}
                    label="Group 3 (TR exclusive)"
                    classNames={{
                      label: "text-primary text-sm pl-[5px] sm:pl-2",
                    }}
                  />
                </Group>
              </Radio.Group>
            </FormField>
          </Grid.Col>

          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <FormField label="Product type">
              <Radio.Group
                {...form.getInputProps("product_type")}
                name="product_type"
              >
                <Group
                  gap={24}
                  w="100%"
                  className="mt-[10px] flex-col sm:flex-row  items-start "
                >
                  <Radio
                    value="saleable"
                    label="saleable"
                    classNames={{
                      label: "text-primary text-sm pl-[5px] sm:pl-2",
                    }}
                  />
                  <Radio
                    value="non-saleable"
                    label="Non-saleable"
                    classNames={{
                      label: "text-primary text-sm pl-[5px] sm:pl-2",
                    }}
                  />
                </Group>
              </Radio.Group>
            </FormField>
          </Grid.Col>
        </Grid>

        <Grid gutter={24}>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <DateInput
              {...form.getInputProps("launch_date")}
              variant="filled"
              valueFormat="YYYY MMM DD"
              label="Launch date"
              placeholder="Select date"
              rightSection={<DateIcon />}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <DateInput
              {...form.getInputProps("discontinue_date")}
              variant="filled"
              valueFormat="YYYY MMM DD"
              label="Discontinued date"
              placeholder="Select date"
              rightSection={<DateIcon />}
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      <FormSection title="Product Details">
        <Grid
          gutter={{
            sm: 32,
            base: 16,
          }}
        >
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("material_description")}
              label="Material Description"
              classNames={textInputStyles}
            />
          </Grid.Col>
          {/* <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("material_tr")}
              label="Material TR"
              classNames={textInputStyles}
            />
          </Grid.Col> */}
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("ean_upc")}
              label="Item EAN/UPC"
              classNames={textInputStyles}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            {/* <TextInput
              {...form.getInputProps("house")}
              label="House"
              classNames={textInputStyles}
            /> */}
             <Select
              {...form.getInputProps("house")}
              label="House"
              data={
                housesData?.data?.map((house) => ({
                  value: house.toString(),
                  label: house.toString(),
                })) || []
              }
              classNames={selectStyles}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <Select
              {...form.getInputProps("brand_id")}
              data={
                brandsData?.data?.map((brand) => ({
                  value: brand.id.toString(),
                  label: brand.name,
                })) || []
              }
              label="Brand"
              classNames={selectStyles}
            />
          </Grid.Col>
          {/* <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <Select
              {...form.getInputProps("sub_brand_id")}
              data={
                brandPillarsData?.data?.map((brand) => ({
                  value: brand.id.toString(),
                  label: brand.name,
                })) || []
              }
              label="Brand Pillar"
              classNames={selectStyles}
              disabled={!form.getValues().brand_id}
            />
          </Grid.Col> */}
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            {/* <TextInput
              {...form.getInputProps("line")}
              label="Line"
              classNames={textInputStyles}
            /> */}
             <Select
              {...form.getInputProps("line")}
              data={
                brandPillarsData?.data?.map((brand) => ({
                  value: brand.id.toString(),
                  label: brand.name,
                })) || []
              }
              label="Line"
              classNames={selectStyles}
              disabled={!form.getValues().brand_id}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <NumberInput
              {...form.getInputProps("line_id")}
              label="Line ID"
              classNames={textInputStyles}
              hideControls
              allowDecimal={false}
              allowNegative={false}
            />
          </Grid.Col>
          {/* <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <NumberInput
              {...form.getInputProps("line_number")}
              label="Line Number"
              classNames={textInputStyles}
              hideControls
              allowDecimal={false}
              allowNegative={false}
            />
          </Grid.Col> */}
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("article_type")}
              label="Article type"
              classNames={textInputStyles}
            />
          </Grid.Col>
          {/* <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("article_sub_type")}
              label="Article sub type"
              classNames={textInputStyles}
            />
          </Grid.Col> */}
        </Grid>
      </FormSection>

      <FormSection title="Product Metadata">
        <Grid
          gutter={{
            sm: 32,
            base: 16,
          }}
        >
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <NumberInput
              {...form.getInputProps("offering_number")}
              label="Offering number"
              classNames={textInputStyles}
              hideControls
              allowDecimal={false}
              allowNegative={false}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("irc")}
              label="IRC"
              classNames={textInputStyles}
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      <FormSection title="Category heading">
        <Grid
          gutter={{
            sm: 32,
            base: 16,
          }}
        >
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <Select
              {...form.getInputProps("category_id")}
              label="Core Category"
              data={
                categoriesData?.data?.map((category) => ({
                  value: category.id.toString(),
                  label: category.name,
                })) || []
              }
              classNames={selectStyles}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <Select
              {...form.getInputProps("subcategory_id")}
              label="Sub category"
              data={
                subCategoriesData?.data?.map((category) => ({
                  value: category.id.toString(),
                  label: category.name,
                })) || []
              }
              classNames={selectStyles}
              disabled={!form.getValues().category_id}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <Select
              {...form.getInputProps("market_id")}
              label="Market"
              data={
                marketsData?.data?.map((market) => ({
                  value: market.id.toString(),
                  label: market.name,
                })) || []
              }
              classNames={selectStyles}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <Select
              {...form.getInputProps("segment_id")}
              label="Segment"
              data={
                segmentsData?.data?.map((segment) => ({
                  value: segment.id.toString(),
                  label: segment.name,
                })) || []
              }
              classNames={selectStyles}
            />
          </Grid.Col>

          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
             <NumberInput
              {...form.getInputProps("icp_eur")}
              label="ICP_EUR"
              classNames={textInputStyles}
              hideControls
              allowDecimal={true}
              allowNegative={false}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <NumberInput
              {...form.getInputProps("icp_usd")}
              label="ICP_USD"
              classNames={textInputStyles}
              hideControls
              allowDecimal={true}
              allowNegative={false}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("factory")}
              label="Factory"
              classNames={textInputStyles}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
               <NumberInput
              {...form.getInputProps("commodity_id")}
              label="Commodity ID"
              classNames={textInputStyles}
              hideControls
              allowDecimal={false}
              allowNegative={false}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <Select
              {...form.getInputProps("country_id")}
              label="Country of origin"
              data={
                countriesData?.data?.map((country) => ({
                  value: country.id.toString(),
                  label: country.name,
                })) || []
              }
              classNames={selectStyles}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <Select
              {...form.getInputProps("gender")}
              label="Gender"
              data={[
                {
                  value: "male",
                  label: "Male",
                },
                {
                  value: "female",
                  label: "Female",
                },
              ]}
              classNames={selectStyles}
            />
          </Grid.Col>
          {/* <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <NumberInput
              {...form.getInputProps("cssp_trex_eur")}
              label="Cssp Trex EUR"
              classNames={textInputStyles}
              hideControls
              allowNegative={false}
            />
          </Grid.Col> */}
          {/* <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <NumberInput
              {...form.getInputProps("cssp_trex_usd")}
              label="Cssp Trex USD"
              classNames={textInputStyles}
              hideControls
              allowNegative={false}
            />
          </Grid.Col> */}
          {/* <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("shade")}
              label="Shade"
              classNames={textInputStyles}
            />
          </Grid.Col> */}
        </Grid>
      </FormSection>

      <FormSection title="Category heading">
        <Grid
          gutter={{
            sm: 32,
            base: 16,
          }}
        >
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("size")}
              label="Size & Dimension"
              classNames={textInputStyles}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <NumberInput
              {...form.getInputProps("length")}
              label="Length"
              classNames={textInputStyles}
              allowDecimal={false}
              allowNegative={false}
              hideControls
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <NumberInput
              {...form.getInputProps("height")}
              label="Height"
              classNames={textInputStyles}
              allowDecimal={false}
              allowNegative={false}
              hideControls
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <NumberInput
              {...form.getInputProps("width")}
              label="Width"
              classNames={textInputStyles}
              allowDecimal={false}
              allowNegative={false}
              hideControls
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <NumberInput
              {...form.getInputProps("volume")}
              label="Volume"
              classNames={textInputStyles}
              allowDecimal={false}
              allowNegative={false}
              hideControls
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <NumberInput
              {...form.getInputProps("gross_weight")}
              label="Gross weight"
              classNames={textInputStyles}
              allowDecimal={false}
              allowNegative={false}
              hideControls
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <NumberInput
              {...form.getInputProps("net_weight")}
              label="Net weight"
              classNames={textInputStyles}
              allowDecimal={false}
              allowNegative={false}
              hideControls
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <NumberInput
              {...form.getInputProps("units")}
              label="Units"
              classNames={textInputStyles}
              allowDecimal={false}
              allowNegative={false}
              hideControls
            />
          </Grid.Col>
          {/* <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("core_heading")}
              label="Core heading"
              classNames={textInputStyles}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("brand_category")}
              label="Sub category"
              classNames={textInputStyles}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("market")}
              label="Market"
              classNames={textInputStyles}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("segment")}
              label="Segment"
              classNames={textInputStyles}
            />
          </Grid.Col>

          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("icp_eur")}
              label="ICP_EUR"
              classNames={textInputStyles}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <NumberInput
              {...form.getInputProps("icp_usd")}
              label="ICP_USD"
              classNames={textInputStyles}
              hideControls
              allowDecimal={false}
              allowNegative={false}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <NumberInput
              {...form.getInputProps("factory")}
              label="Factory"
              classNames={textInputStyles}
              hideControls
              allowDecimal={false}
              allowNegative={false}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("commodity_id")}
              label="Commodity ID"
              classNames={textInputStyles}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <Select
              {...form.getInputProps("country_id")}
              label="Country of origin"
              data={
                countriesData?.data?.map((country) => ({
                  value: country.id.toString(),
                  label: country.name,
                })) || []
              }
              classNames={selectStyles}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <Select
              {...form.getInputProps("gender")}
              label="Gender"
              data={[
                {
                  value: "male",
                  label: "Male",
                },
                {
                  value: "female",
                  label: "Female",
                },
              ]}
              classNames={selectStyles}
            />
          </Grid.Col> */}
          {/* <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <NumberInput
              {...form.getInputProps("cssp_trex_eur")}
              label="Cssp Trex EUR"
              classNames={textInputStyles}
              hideControls
              allowNegative={false}
            />
          </Grid.Col> */}
          {/* <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <NumberInput
              {...form.getInputProps("cssp_trex_usd")}
              label="Cssp Trex USD"
              classNames={textInputStyles}
              hideControls
              allowNegative={false}
            />
          </Grid.Col> */}
          {/* <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("shade")}
              label="Shade"
              classNames={textInputStyles}
            />
          </Grid.Col> */}
        </Grid>
      </FormSection>

      <FormSection title="Upload documents" className="mb-5">
        <FileUploadSection
          form={form}
          multiple
          id="documents"
          productId={product?.id}
          span={{
            lg: 4,
            base: 12,
          }}
        />
      </FormSection>

      <BrandTypeConfirmationModal
        open={showDivisionModal}
        oldType={
          initialDivision.current === "luxury"
            ? "Luxury"
            : initialDivision.current === "mass"
              ? "Mass"
              : "-"
        }
        newType={
          pendingSubmitValues?.division === "luxury"
            ? "Luxury"
            : pendingSubmitValues?.division === "mass"
              ? "Mass"
              : "-"
        }
        onCancel={() => {
          setShowDivisionModal(false);
          setPendingSubmitValues(null);
        }}
        onConfirm={async () => {
          setShowDivisionModal(false);
          if (pendingSubmitValues) {
            setIsSubmitting(true);
            const values = pendingSubmitValues;
            setPendingSubmitValues(null);
        
            const { documents, ...toSubmit } = values;
            const newDocuments = (documents as (Document & { id?: string })[])?.filter((doc) => !doc.id);
        
            if (newDocuments?.length) {
              await Promise.all(
                newDocuments.map((doc) =>
                  addDocument.mutateAsync({
                    productId: product?.id || 0,
                    data: {
                      title: doc.title,
                      url: doc.url,
                    },
                  })
                )
              );
            }
            
            updateProduct.mutate(
              {
                data: {
                  ...toSubmit,
                  grouping: Number(values.grouping),
                  launch_date: values.launch_date?.toISOString().split("T")[0],
                  discontinue_date: values.discontinue_date
                    ?.toISOString()
                    .split("T")[0],
                  price_benchmark: (values.price_benchmark as PriceBenchmark) || null,
                  division: values.division,
                },
              },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({
                    queryKey: ["products"],
                    refetchType: "all",
                  });
                  navigate({ to: "/products" });
                },
                onSettled: () => setIsSubmitting(false),
              }
            );
          }
        }}
      />
    </form>
  );
});

export { AddProductForm };
export default AddProductForm;
