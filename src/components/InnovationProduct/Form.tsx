import { getBrands } from "@/api/get-brands";
import { getCountries } from "@/api/get-countries";
import { getCategories } from "@/api/listManagement/coreCategories/get-categories";
import { getMarkets } from "@/api/listManagement/markets/get-markets";
import { getSegments } from "@/api/listManagement/segments/get-segments";
import { getProductDistributors } from "@/api/products/get-product-distributors";
import { getProducts } from "@/api/products/get-products";
import { queryClient } from "@/main";
import { Product } from "@/types";
import {
  Button,
  Grid,
  Group,
  Loader,
  Radio,
  Select,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { UseFormReturnType } from "@mantine/form";
import { useQueries } from "@tanstack/react-query";
import get from "lodash.get";
import React, { useEffect, useState } from "react";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import DateIcon from "../Icons/DateIcon";
import { FormField } from "../Shared/Form/Field";
import { FileUploadSection } from "../Shared/Form/FileUploadSection";
import { FormSection } from "../Shared/Form/Section";

const EditInnovationProductForm = ({
  path,
  form,
  setProductOpen,
}: {
  path: string;
  form: UseFormReturnType<{
    brand_id: string;
    sub_brand_id: string;
    year: Date;
    format: string;
    launch_name: string;
    other_name: string;
    document: string;
    forecast_deadline: Date;
    offerings?: {
      number: string;
      icw: Date;
      ocd: Date;
      type: string;
      deck: string;
      market_deck: string;
      products: Array<
        Partial<Product> & {
          currency: string;
        }
      >;
    }[];
  }>;
  setProductOpen: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [changed, setChanged] = useState<{
    pref: boolean;
    brand_id: boolean;
  }>({
    pref: false,
    brand_id: false,
  });
  const [
    { data: marketsData, isLoading: marketsLoading },
    { data: segmentsData, isLoading: segmentsLoading },
    { data: categoriesData, isLoading: categoriesLoading },
    { data: brandsData, isLoading: brandsLoading },
    { data: countriesData, isLoading: countriesLoading },
    // { data: currenciesData },
    // { data: brandPillarsData },
    { data: productsListData, isLoading: productsLoading },
    { data: productDistributorsData, isLoading: productDistrubutorsLoading },
  ] = useQueries({
    queries: [
      {
        queryKey: ["markets"],
        queryFn: () => getMarkets({ page_size: 999999 }),
      },
      {
        queryKey: ["segments"],
        queryFn: () => getSegments({ page_size: 999999 }),
      },
      {
        queryKey: ["categories"],
        queryFn: () => getCategories({ page_size: 999999 }),
      },
      { queryKey: ["brands"], queryFn: () => getBrands() },
      { queryKey: ["countriues"], queryFn: getCountries },
      // { queryKey: ["currencies"], queryFn: getCurrencies },
      // { queryKey: ["brandPillars"], queryFn: getBrandPillars },
      {
        queryKey: ["products"],
        queryFn: () => getProducts({ page_size: 10 }),
      },
      {
        queryKey: ["product-distributor"],
        queryFn: () =>
          getProductDistributors(
            get(form.getValues(), path).brand_id as string,
            get(form.getValues(), path).pref as string
          ),
        enabled:
          get(form.getValues(), path).brand_id !== undefined &&
          get(form.getValues(), path).pref !== undefined,
      },
    ],
  });

  // const addDocument = useAddDocument({
  //   mutationConfig: {
  //     onError: (error) => {
  //       toast.error(error.message);
  //     },
  //   },
  // });

  form.watch("brand_id", ({ value }) => {
    setChanged((prev) => {
      return {
        ...prev,
        brand_id: value ? true : false,
      };
    });
  });

  form.watch("pref", ({ value }) => {
    setChanged((prev) => {
      return {
        ...prev,
        pref: value ? true : false,
      };
    });
  });

  useEffect(() => {
    const fetchProductDistributors = async () => {
      const { brand_id, pref } = get(form.getValues(), path);
      if (brand_id && pref) {
        if (changed.brand_id || changed.pref) {
          await queryClient.invalidateQueries({
            queryKey: ["product-distributor"],
            exact: true,
            refetchType: "all",
          });
          setChanged({
            brand_id: false,
            pref: false,
          });
          productDistributorsData?.data.map((dist, idx) => {
            if (dist.coefficients.length > 0) {
              form.setFieldValue(`distributor_pricing.${idx}`, {
                distributor_id: dist.id,
              });
            }
          });
        }
      }
    };
    fetchProductDistributors();
  }, [changed.brand_id, changed.pref, form]);

  if (
    brandsLoading ||
    marketsLoading ||
    productsLoading ||
    countriesLoading ||
    categoriesLoading ||
    productDistrubutorsLoading ||
    segmentsLoading
  )
    return <Loader />;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-primary">Add IRC Product</h2>
        <p className="text-gray-600 text-sm mt-1">
          Add product details to your offering
        </p>
      </div>
      <FormSection title="Product details" className="mt-2 sm:mt-5">
        <Radio.Group
          {...form.getInputProps(`${path}.pref`)}
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
              <Radio.Group
                {...form.getInputProps(`${path}.grouping`)}
                name="grouping"
              >
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
              <Radio.Group {...form.getInputProps(`type`)} name="product_type">
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
              {...form.getInputProps(`${path}.launch_date`)}
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
              {...form.getInputProps(`${path}.discontinue_date`)}
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
              {...form.getInputProps(`${path}.offering_number`)}
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
              {...form.getInputProps(`${path}.irc`)}
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
              {...form.getInputProps(`${path}.material_description`)}
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
              {...form.getInputProps(`${path}.ean_upc`)}
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
              {...form.getInputProps(`${path}.house`)}
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
              {...form.getInputProps(`${path}.brand_id`)}
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
              {...form.getInputProps(`${path}.line`)}
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
              {...form.getInputProps(`${path}.line_id`)}
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
              {...form.getInputProps(`${path}.article_type`)}
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
              {...form.getInputProps(`${path}.division`)}
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
              {...form.getInputProps(`${path}.category_id`)}
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
              {...form.getInputProps(`${path}.subcategory_id`)}
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
              {...form.getInputProps(`${path}.market_id`)}
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
            <Select
              {...form.getInputProps(`${path}.segment_id`)}
              label="Market"
              data={
                segmentsData?.data?.map((segment) => ({
                  value: segment.id.toString(),
                  label: segment.name,
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
              {...form.getInputProps(`${path}.icp_eur`)}
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
              {...form.getInputProps(`${path}.icp_usd`)}
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
              {...form.getInputProps(`${path}.factory`)}
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
              {...form.getInputProps(`${path}.commodity_id`)}
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
              {...form.getInputProps(`${path}.country_id`)}
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
            <Select
              {...form.getInputProps(`${path}.gender`)}
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
              {...form.getInputProps(`${path}.size`)}
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
              {...form.getInputProps(`${path}.length`)}
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
              {...form.getInputProps(`${path}.height`)}
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
              {...form.getInputProps(`${path}.width`)}
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
              {...form.getInputProps(`${path}.volume`)}
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
              {...form.getInputProps(`${path}.gross_weight`)}
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
              {...form.getInputProps(`${path}.net_weight`)}
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
              {...form.getInputProps(`${path}.units`)}
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
              {...form.getInputProps(`${path}.price_benchmark.brand_id`)}
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
              key={form.key("price_benchmark.product_id")}
              {...form.getInputProps("price_benchmark.product_id")}
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
              {...form.getInputProps(`${path}.price_benchmark.comment`)}
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

      {/* <FormSection title="Distributors Pricing">
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
      </FormSection> */}

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

      <Group justify="flex-end" mt="md">
        <Button
          variant="outline"
          className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
          onClick={() => setProductOpen(-1)}
        >
          Back
        </Button>
        <Button type="submit" onClick={() => setProductOpen(-1)}>
          Submit
        </Button>
      </Group>
    </div>
  );
};

export default EditInnovationProductForm;
