import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { getBrandPillars } from "@/api/get-brandPillars";
import { getBrands } from "@/api/get-brands";
import { getCountries } from "@/api/get-countries";
import { getCategories } from "@/api/listManagement/coreCategories/get-categories";
import { getMarkets } from "@/api/listManagement/markets/get-markets";
import { getSegments } from "@/api/listManagement/segments/get-segments";
import { getSubcategories } from "@/api/listManagement/subCategories/get-subcategories";
import { useAddDocument } from "@/api/products/add-document";
import { addProductSchema, useAddProduct } from "@/api/products/add-product";
import { getProductDistributors } from "@/api/products/get-product-distributors";
import { getProducts } from "@/api/products/get-products";
import { useUpdateProduct } from "@/api/products/update-product";
import { ApiResponseFiles } from "@/api/products/upload-document";
import { queryClient } from "@/main";
import { PriceBenchmark, Product, ProductInput } from "@/types";
import {
  Button,
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
import { toast } from "react-toastify";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import CornerDownRightIcon from "../Icons/CornerDownRightIcon";
import DateIcon from "../Icons/DateIcon";
import { FormField } from "../Shared/Form/Field";
import { FileUploadSection } from "../Shared/Form/FileUploadSection";
import { PricingFields } from "../Shared/Form/PricingFields";
import { FormSection } from "../Shared/Form/Section";
import { StatusCard } from "../Shared/Form/StatusCard";
import {
  selectStyles,
  textAreaStyles,
  textInputStyles,
} from "../Shared/Styles";

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
      category_id: category.id.toString(),
      subcategory_id: subcategory.id.toString(),
      sub_brand_id: brand_pillar.id.toString(),
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

  const form = useForm<Partial<ProductInput>>({
    mode: "uncontrolled",
    initialValues: isEdit
      ? productToEdit
      : {
          price_benchmark: {},
          distributor_pricing: [],
        },
    validate: zodResolver(addProductSchema),
  });

  const [
    { data: marketsData, isLoading: marketsLoading },
    { data: segmentsData, isLoading: segmentsLoading },
    { data: categoriesData, isLoading: categoriesLoading },
    { data: subCategoriesData, isLoading: subCategoriesLoading },
    { isLoading: gmmSubCategoriesLoading },
    { data: brandsData, isLoading: brandsLoading },
    { data: countriesData, isLoading: countriesLoading },
    // { data: currenciesData },
    { data: brandPillarsData, isLoading: brandPillarsLoading },
    { data: productsListData, isLoading: productsLoading },
    { data: productDistributorsData, isLoading: productDistrubutorsLoading },
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
        queryFn: () => getCategories({ page_size: 999999 }),
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
      { queryKey: ["brands"], queryFn: getBrands },
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
        setIsSubmitting(true);
        try {
          const { documents, ...toSubmit } = values;
          if (isEdit) {
            const promises: Promise<ApiResponseFiles>[] = [];
            documents?.map((doc: { title: string; url: string }) => {
              const data = addDocument.mutateAsync({
                productId: product?.id || 0,
                data: {
                  title: doc.title,
                  url: doc.url,
                },
              });
              promises.push(data);
            });
            updateProduct.mutate(
              {
                data: {
                  ...toSubmit,
                  grouping: Number(values.grouping),
                  launch_date: values.launch_date?.toISOString().split("T")[0],
                  discontinue_date: values.discontinue_date
                    ?.toISOString()
                    .split("T")[0],
                  price_benchmark:
                    (values.price_benchmark as PriceBenchmark) || null,
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
                  price_benchmark:
                    (values.price_benchmark as PriceBenchmark) || null,
                  documents: documents,
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
              label="Discount date"
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
          <Grid.Col
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
          </Grid.Col>
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
            <TextInput
              {...form.getInputProps("house")}
              label="House"
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
          <Grid.Col
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
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("line")}
              label="Line"
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
              {...form.getInputProps("line_id")}
              label="Line ID"
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
              {...form.getInputProps("line_number")}
              label="Line Number"
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
              {...form.getInputProps("article_type")}
              label="Article type"
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
              {...form.getInputProps("article_sub_type")}
              label="Article sub type"
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
              {...form.getInputProps("division")}
              label="Division"
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
            />
          </Grid.Col>
          <Grid.Col
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
          </Grid.Col>
          <Grid.Col
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
          </Grid.Col>
          <Grid.Col
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
          </Grid.Col>
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
              label="Offering number (optional)"
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

      <FormSection title="Product Pricing">
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
              {...form.getInputProps("icp_eur")}
              label="ICP EUR"
              classNames={textInputStyles}
              hideControls
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
              label="ICP USD"
              classNames={textInputStyles}
              hideControls
              allowNegative={false}
            />
          </Grid.Col>
        </Grid>
      </FormSection>
      <FormSection title="Product Origins">
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
              label="gmm category"
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
              label="gmm sub category"
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
              label="gmm market"
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
              label="gmm segment"
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
        </Grid>
      </FormSection>

      <FormSection title="Product Dimensions">
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
        </Grid>
      </FormSection>
      <FormSection title="Price benchmark">
        <Grid
          gutter={{
            sm: 24,
            base: 16,
          }}
        >
          <Grid.Col
            span={{
              sm: 4,
              base: 12,
            }}
          >
            <Select
              label="Brand"
              placeholder="Select Brand"
              key={form.key("price_benchmark.brand_id")}
              {...form.getInputProps("price_benchmark.brand_id")}
              data={
                brandsData?.data?.map((brand) => ({
                  value: brand.id.toString(),
                  label: brand.name,
                })) || []
              }
              clearable
              classNames={selectStyles}
              rightSection={<ChevronDownIcon />}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 4,
              base: 6,
            }}
          >
            <Select
              label="Product"
              placeholder="Select Product"
              key={form.key("price_benchmark.product_id")}
              {...form.getInputProps("price_benchmark.product_id")}
              data={
                productsListData?.data?.map((product) => ({
                  value: product.id.toString(),
                  label: product.id.toString(),
                })) || []
              }
              clearable
              classNames={selectStyles}
              rightSection={<ChevronDownIcon />}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 4,
              base: 6,
            }}
          >
            <NumberInput
              key={form.key("price_benchmark.index_value")}
              {...form.getInputProps("price_benchmark.index_value")}
              label="Index value"
              classNames={textInputStyles}
              allowDecimal={false}
              allowNegative={false}
              hideControls
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput
              key={form.key("price_benchmark.comment")}
              {...form.getInputProps("price_benchmark.comment")}
              label="Add a comment"
              placeholder="HB BOT PM 24 EDP 50ml PREM IV"
              classNames={textAreaStyles}
            />
          </Grid.Col>
        </Grid>

        <Button
          variant="default"
          className="border-primary w-fit bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-3 hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
        >
          Set price benchmark
        </Button>
      </FormSection>

      <FormSection title="Distributors Pricing">
        {productDistributorsData?.data.map((item, item_idx) => (
          <Grid
            gutter={{
              sm: 24,
              base: 16,
            }}
            key={`${item.name}-${item_idx}`}
          >
            <Grid.Col span={12}>
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-6 ">
                  <StatusCard
                    title={item.name}
                    chipType="green"
                    chipLabels={{
                      primary: item.type,
                      secondary: item.registered
                        ? "registered"
                        : "not registered",
                    }}
                  >
                    // @ts-expect-error
                    <PricingFields
                      form={form}
                      prefix={`distributor_pricing.${item_idx}`}
                      coefficientsData={item.coefficients}
                      distributorId={item.id}
                      isMirror={!(item.coefficients.length > 0)}
                    />
                  </StatusCard>
                </div>
                {item.mirrors &&
                  item.mirrors.map((mirror, mirror_idx) => {
                    return (
                      <div
                        className="flex items-start gap-4 "
                        key={`${mirror.name}-${mirror_idx}`}
                      >
                        <CornerDownRightIcon />
                        <StatusCard
                          title={item.name}
                          chipType="green"
                          isChild
                          chipLabels={{
                            primary: item.type,
                            secondary: item.registered,
                          }}
                        >
                          // @ts-expect-error
                          <PricingFields
                            isMirror
                            form={form}
                            prefix={`distributor_pricing.${item_idx}.mirrors.${mirror_idx}`}
                            coefficientsData={mirror.coefficients}
                          />
                        </StatusCard>
                      </div>
                    );
                  })}
              </div>
            </Grid.Col>
          </Grid>
        ))}
      </FormSection>

      <FormSection title="Upload documents">
        <FileUploadSection
          form={form}
          multiple
          id="documents"
          span={{
            lg: 4,
            base: 12,
          }}
        />
      </FormSection>
    </form>
  );
});

export { AddProductForm };
export default AddProductForm;
