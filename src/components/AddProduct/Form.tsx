import {
  Button,
  Divider,
  Grid,
  Group,
  Radio,
  Select,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import { FormSection } from "../Shared/Form/Section";
import { FormField } from "../Shared/Form/Field";
import DateIcon from "../Icons/DateIcon";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { StatusCard } from "../Shared/Form/StatusCard";
import CornerDownRightIcon from "../Icons/CornerDownRightIcon";
import { FileUploadSection } from "../Shared/Form/FileUploadSection";
import { PricingFields } from "../Shared/Form/PricingFields";
import { useQueries } from "@tanstack/react-query";
import { getMarkets } from "@/api/get-markets";
import { getRegions } from "@/api/get-regions";
import { getCategories } from "@/api/get-categories";
import { getBrands } from "@/api/get-brands";
import { getCountries } from "@/api/get-countries";
import { PriceBenchmark, Product, ProductInput } from "@/types";
import { useUpdateProduct } from "@/api/products/update-product";
import { useEffect } from "react";
import { useAddProduct } from "@/api/products/add-product";
import { useAddDocument } from "@/api/products/add-document";
import { ApiResponseFiles } from "@/api/products/upload-document";
import { getProducts } from "@/api/products/get-products";

const AddProductForm = ({
  isEdit = false,
  product,
}: {
  isEdit?: boolean;
  product?: Product;
}) => {
  const [
    { data: marketsData },
    { data: categoriesData },
    { data: brandsData },
    { data: countriesData },
    // { data: currenciesData },
    // { data: brandPillarsData },
    { data: productsListData },
  ] = useQueries({
    queries: [
      { queryKey: ["markets"], queryFn: getMarkets },
      { queryKey: ["categories"], queryFn: getCategories },
      { queryKey: ["brands"], queryFn: getBrands },
      { queryKey: ["regions"], queryFn: getRegions },
      { queryKey: ["countriues"], queryFn: getCountries },
      // { queryKey: ["currencies"], queryFn: getCurrencies },
      // { queryKey: ["brandPillars"], queryFn: getBrandPillars },
      {
        queryKey: ["products"],
        queryFn: () => getProducts({ page: 1, per_page: 20 }),
      },
    ],
  });

  const updateProduct = useUpdateProduct({
    mutationConfig: {},
  });

  const addProduct = useAddProduct({
    mutationConfig: {},
  });

  const addDocument = useAddDocument({
    mutationConfig: {},
  });

  const form = useForm<Partial<ProductInput>>({
    initialValues: isEdit
      ? {}
      : {
          price_benchmark: {
            product_id: "1",
          },
          distributor_pricing: [
            {
              active_rrsp: "",
              billing: "",
              coefficient_id: "",
              currency: "",
              distributor_id: "1",
              preactive_rrsp: "",
            },
          ],
        },
  });

  useEffect(() => {
    if (isEdit && product) {
      const { brand, market, country, subcategory, category, ...flatProduct } =
        product;
      const productToEdit = {
        ...flatProduct,
        brand_id: brand.id.toString(),
        market_id: market.id.toString(),
        country_id: country.id.toString(),
        category_id: category.id.toString(),
        subcategory_id: subcategory.id.toString(),
        launch_date: new Date(product?.launch_date),
        discontinue_date: new Date(product.discontinue_date),
        price_benchmark: flatProduct.price_benchmark || {},
      };
      form.setInitialValues(productToEdit);
      form.reset();
    }
  }, []);

  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { documentsPlaceholder, documents, ...toSubmit } = values;
        console.log(values);
        if (isEdit) {
          const promises: Promise<ApiResponseFiles>[] = [];
          documents?.map((doc) => {
            const data = addDocument.mutateAsync({
              productId: product?.id || 0,
              data: {
                title: doc.title,
                url: doc.url,
              },
            });
            promises.push(data);
          });
          updateProduct.mutate({
            data: {
              ...toSubmit,
              launch_date: values.launch_date?.toISOString().split("T")[0],
              discontinue_date: values.discontinue_date
                ?.toISOString()
                .split("T")[0],
              price_benchmark:
                (values.price_benchmark as PriceBenchmark) || null,
            },
          });
        } else {
          addProduct.mutate({
            data: {
              ...toSubmit,
              launch_date: values.launch_date?.toISOString().split("T")[0],
              discontinue_date: values.discontinue_date
                ?.toISOString()
                .split("T")[0],
              price_benchmark:
                (values.price_benchmark as PriceBenchmark) || null,
              documents: documents,
            },
          });
        }
      })}
    >
      <FormSection title="Product details" className="mt-2 sm:mt-5">
        <Radio.Group
          {...form.getInputProps("pref")}
          name="preference"
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
                    value="sealable"
                    label="Sealable"
                    classNames={{
                      label: "text-primary text-sm pl-[5px] sm:pl-2",
                    }}
                  />
                  <Radio
                    value="non-sealable"
                    label="Non-sealable"
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
            <TextInput
              {...form.getInputProps("offering_number")}
              label="Offering number (optional)"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
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
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
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
              label="Material description"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
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
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
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
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
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
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
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
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("line_id")}
              label="Line ID"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
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
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("division")}
              label="Division"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
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
              label="Core category"
              data={
                categoriesData?.data?.map((category) => ({
                  value: category.id.toString(),
                  label: category.name,
                })) || []
              }
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
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
                categoriesData?.data?.map((category) => ({
                  value: category.id.toString(),
                  label: category.name,
                })) || []
              }
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
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
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
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
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
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
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("icp_usd")}
              label="ICP_USD"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
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
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
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
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
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
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("gender")}
              label="Gender"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
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
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("length")}
              label="Length"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("height")}
              label="Height"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("width")}
              label="Width"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("volume")}
              label="Volume"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("gross_weight")}
              label="Gross weight"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("net_weight")}
              label="Net weight"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("units")}
              label="Units"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
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
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
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
              data={
                productsListData?.data?.map((product) => ({
                  value: product.id.toString(),
                  label: product.id.toString(),
                })) || []
              }
              clearable
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
              rightSection={<ChevronDownIcon />}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 4,
              base: 6,
            }}
          >
            <TextInput
              key={form.key("price_benchmark.index_value")}
              {...form.getInputProps("price_benchmark.index_value")}
              label="Index value"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput
              key={form.key("price_benchmark.comment")}
              {...form.getInputProps("price_benchmark.comment")}
              label="Add a comment"
              placeholder="HB BOT PM 24 EDP 50ml PREM IV"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
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
        <Grid
          gutter={{
            sm: 24,
            base: 16,
          }}
        >
          <Grid.Col span={12} className="gap-6 flex items-center">
            <StatusCard title="W AIR" chipType="blue">
              <PricingFields
                form={form}
                prefix="distributor_pricing.0"
                distributorId="1"
              />
            </StatusCard>
          </Grid.Col>
        </Grid>

        <Divider className="border-primary border-opacity-50" />

        <Grid
          gutter={{
            sm: 24,
            base: 16,
          }}
        >
          <Grid.Col span={12}>
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-6 ">
                <StatusCard
                  title="DOM"
                  chipType="green"
                  chipLabels={{
                    primary: "Formal",
                    secondary: "Not registered",
                  }}
                >
                  <PricingFields
                    form={form}
                    prefix="distributor_pricing.1"
                    distributorId="2"
                  />
                </StatusCard>
              </div>
              <div className="flex items-start gap-4 ">
                <CornerDownRightIcon />
                <StatusCard
                  title="OLKA"
                  chipType="green"
                  isChild
                  chipLabels={{
                    primary: "Formal",
                    secondary: "Not registered",
                  }}
                >
                  <PricingFields
                    form={form}
                    prefix="distributor_pricing.2"
                    distributorId="3"
                  />
                </StatusCard>
              </div>
              <div className="flex items-start gap-4">
                <CornerDownRightIcon />
                <StatusCard
                  title="MAVEN"
                  chipType="purple"
                  isChild
                  chipLabels={{
                    primary: "Regional",
                    secondary: "Not registered",
                  }}
                >
                  <PricingFields
                    form={form}
                    prefix="distributor_pricing.3"
                    distributorId="4"
                  />
                </StatusCard>
              </div>
            </div>
          </Grid.Col>
        </Grid>
      </FormSection>

      <FormSection title="Upload documents">
        <FileUploadSection
          form={form}
          multiple
          id="documentsPlaceholder"
          span={{
            lg: 4,
            base: 12,
          }}
        />
      </FormSection>

      <Group justify="flex-end" mt="md">
        <Button type="submit">Submit</Button>
      </Group>
    </form>
  );
};

export default AddProductForm;
