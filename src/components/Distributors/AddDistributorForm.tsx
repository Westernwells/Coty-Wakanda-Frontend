import { Currency, getCurrencies } from "@/api/get-currencies";
import {
  Button,
  Grid,
  Group,
  Loader,
  MultiSelect,
  Radio,
  Select,
  TextInput,
} from "@mantine/core";

import { useAddDistributor } from "@/api/distributors/add-distributor";
import {
  updateDistributorInput,
  updateDistributorInputSchema,
  useUpdateDistributor,
} from "@/api/distributors/update-distributor";
import { getBrandPillars } from "@/api/get-brandPillars";
import { getBrands } from "@/api/get-brands";
import { getRegions } from "@/api/get-regions";
import { getCategories } from "@/api/listManagement/coreCategories/get-categories";
import { getMarkets } from "@/api/listManagement/markets/get-markets";
import { Distributor, Pref } from "@/types";
import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useQueries } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { PlusIcon as LucidePlusIcon } from "lucide-react";
import { useLayoutEffect } from "react";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import ExitIcon from "../Icons/ExitIcon";
import PlusIcon from "../Icons/PlusIcon";
import RefreshIcon from "../Icons/RefreshIcon";
import { selectStyles, textInputStyles } from "../Shared/Styles";
import CoefficientsForm from "./CoefficientsForm";
import CoefficientsTable from "./CoefficientsTable";

export type FormValues = updateDistributorInput & {
  coefficients: Array<{
    value: string;
    brand_id: number;
    category_id: number;
    pref: Pref;
  }>;
};

const AddDistributorForm = ({
  isEdit = false,
  formData,
}: {
  isEdit?: boolean;
  formData?: Distributor;
}) => {
  const form = useForm<FormValues>({
    initialValues: {
      type: "formal",
      name: "",
      regions: [],
      markets: [],
      company_registration_number: "",
      contact_person: "",
      contact_email: "",
      categories: [],
      brands: [],
      brand_pillars: [],
      currency: "",
      coefficients: [],
      mirror: {
        group_one: "",
        group_two: "",
      },
    },
    validate: zodResolver(updateDistributorInputSchema),
  });
  const navigate = useNavigate();

  const [opened, { open, close }] = useDisclosure(false);

  const [
    { data: marketsData },
    { data: regionsData },
    { data: categoriesData },
    { data: brandsData },
    { data: currenciesData },
    { data: brandPillarsData },
  ] = useQueries({
    queries: [
      {
        queryKey: ["markets", form.values.regions],
        queryFn: () =>
          getMarkets({
            filter: {
              region_id: Array.isArray(form.values.regions)
                ? form.values.regions.join(",")
                : form.values.regions,
            },
            page_size: 99999,
          }),
      },
      { queryKey: ["regions"], queryFn: getRegions },
      {
        queryKey: ["categories"],
        queryFn: () => getCategories({ page_size: 9999 }),
      },
      { queryKey: ["brands"], queryFn: getBrands },
      { queryKey: ["currencies"], queryFn: getCurrencies },
      { queryKey: ["brandPillars"], queryFn: () => getBrandPillars() },
    ],
  });

  useLayoutEffect(() => {
    if (formData && isEdit) {
      form.setValues({
        ...formData,
        regions: formData.regions.map((region) => region.id.toString()),
        categories: formData.categories.map((category) =>
          category.id.toString()
        ),
        markets: formData.markets.map((market) => market.id.toString()),
        brands: formData.brands.map((brand) => brand.id.toString()),
        brand_pillars:
          formData.brand_pillars?.map((brand) => brand.id.toString()) || [],
        coefficients: formData.coefficients.map((coefficient) => ({
          value: coefficient.value,
          brand_id: coefficient.brand.id,
          category_id: coefficient.category.id,
          pref: coefficient.pref,
        })),
        mirror: {
          group_one: formData.mirror.group_one?.toString(),
          group_two: formData.mirror.group_two?.toString(),
        },
      });
    }
  }, [formData, isEdit]);

  const updateDistributorMutations = useUpdateDistributor({
    mutationConfig: {
      onSuccess: () => navigate({ to: "/distributors" }),
    },
  });
  const addDistributorMutations = useAddDistributor({
    mutationConfig: {
      onSuccess: () => navigate({ to: "/distributors" }),
    },
  });

  const mirrorOptions = [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
  ];

  return (
    <>
      {updateDistributorMutations.isPending ||
      addDistributorMutations.isPending ? (
        <div className="flex justify-center items-center mt-6">
          <Loader />
        </div>
      ) : (
        <>
          <form
            onSubmit={form.onSubmit((values) => {
              if (isEdit) {
                updateDistributorMutations.mutate({
                  distributorId: formData?.id as number,
                  data: values,
                });
              } else {
                addDistributorMutations.mutate({
                  data: values,
                });
              }
            })}
            className="mt-2 sm:mt-5"
          >
            <div className="bg-white rounded-2xl p-6">
              <div className="space-y-6">
                <div>
                  <span className="text-primary font-medium text-sm mb-2 block">
                    Distributor type
                  </span>
                  <Radio.Group {...form.getInputProps("type")} name="type">
                    <Group gap={24}>
                      <Radio
                        value="formal"
                        label="Formal"
                        classNames={{
                          label: "text-primary text-sm pl-2",
                        }}
                      />
                      <Radio
                        value="hybrid"
                        label="Hybrid"
                        classNames={{
                          label: "text-primary text-sm pl-2",
                        }}
                      />
                      <Radio
                        value="regional"
                        label="Regional"
                        classNames={{
                          label: "text-primary text-sm pl-2",
                        }}
                      />
                    </Group>
                  </Radio.Group>
                </div>

                <Grid gutter={24}>
                  <Grid.Col span={12}>
                    <TextInput
                      {...form.getInputProps("name")}
                      label="Business name"
                      placeholder="Enter business name"
                      classNames={textInputStyles}
                    />
                  </Grid.Col>
                </Grid>

                <Grid gutter={24}>
                  <Grid.Col span={{ sm: 6, base: 12 }}>
                    <MultiSelect
                      {...form.getInputProps("regions")}
                      label="Regions"
                      placeholder="Select regions"
                      data={
                        regionsData?.data?.map((region) => ({
                          value: region.id.toString(),
                          label: region.name,
                        })) || []
                      }
                      value={form.values.regions}
                      rightSection={<ChevronDownIcon />}
                      classNames={selectStyles}
                      clearable
                      autoComplete="off"
                      searchable
                    />
                  </Grid.Col>
                  <Grid.Col span={{ sm: 6, base: 12 }}>
                    <MultiSelect
                      {...form.getInputProps("markets")}
                      label="Markets/Countries"
                      placeholder="Select markets/countries"
                      value={form.values.markets}
                      data={
                        marketsData?.data?.map((market) => ({
                          value: market.id.toString(),
                          label: market.name,
                        })) || []
                      }
                      rightSection={<ChevronDownIcon />}
                      classNames={selectStyles}
                      clearable
                      searchable
                      autoComplete="off"
                    />
                  </Grid.Col>
                </Grid>

                <Grid gutter={24}>
                  <Grid.Col span={{ sm: 6, base: 12 }}>
                    <TextInput
                      {...form.getInputProps("company_registration_number")}
                      label="Company registration number"
                      placeholder="Enter registration number"
                      classNames={textInputStyles}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ sm: 6, base: 12 }}>
                    <TextInput
                      {...form.getInputProps("contact_person")}
                      label="Contact person"
                      placeholder="Enter contact person"
                      classNames={textInputStyles}
                    />
                  </Grid.Col>
                </Grid>

                <Grid gutter={24}>
                  <Grid.Col span={{ sm: 6, base: 12 }}>
                    <TextInput
                      {...form.getInputProps("contact_email")}
                      label="Contact email"
                      placeholder="Enter email address"
                      type="email"
                      classNames={textInputStyles}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ sm: 6, base: 12 }}>
                    <MultiSelect
                      {...form.getInputProps("categories")}
                      label="Categories"
                      placeholder="Select categories"
                      value={form.values.categories}
                      data={
                        categoriesData?.data?.map((category) => ({
                          value: category.id.toString(),
                          label: category.name,
                        })) || []
                      }
                      rightSection={<ChevronDownIcon />}
                      classNames={selectStyles}
                      clearable
                      searchable
                    />
                  </Grid.Col>
                </Grid>

                <Grid gutter={24}>
                  <Grid.Col span={{ sm: 6, base: 12 }}>
                    <MultiSelect
                      {...form.getInputProps("brands")}
                      label="Marketed COTY brands"
                      value={form.values.brands}
                      placeholder="Select brands"
                      data={
                        brandsData?.data?.map((brand) => ({
                          value: brand.id.toString(),
                          label: brand.name,
                        })) || []
                      }
                      rightSection={<ChevronDownIcon />}
                      classNames={selectStyles}
                      clearable
                      searchable
                    />
                  </Grid.Col>
                  <Grid.Col span={{ sm: 6, base: 12 }}>
                    <MultiSelect
                      {...form.getInputProps("brand_pillars")}
                      label="Brand pillars"
                      placeholder="Select brand pillars"
                      data={
                        brandPillarsData?.data?.map((pillar) => ({
                          value: pillar.id.toString(),
                          label: pillar.name,
                        })) || []
                      }
                      rightSection={<ChevronDownIcon />}
                      classNames={selectStyles}
                      clearable
                      searchable
                    />
                  </Grid.Col>
                </Grid>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 mt-6">
              <h2 className="text-lg font-semibold mb-6">Category heading</h2>
              <div className="space-y-6">
                <Grid gutter={24}>
                  <Grid.Col span={{ sm: 6, base: 12 }}>
                    <Select
                      {...form.getInputProps("currency")}
                      label="Currency"
                      placeholder="Select currency"
                      value={form.values.currency}
                      data={
                        currenciesData?.data?.map((currency: Currency) => ({
                          value: currency.code,
                          label: `${currency.code} (${currency.symbol}) - ${currency.name}`,
                        })) || []
                      }
                      rightSection={<ChevronDownIcon />}
                      classNames={selectStyles}
                      clearable
                      searchable
                    />
                  </Grid.Col>
                </Grid>

                <Grid gutter={24}>
                  <Grid.Col span={{ sm: 6, base: 12 }}>
                    <Select
                      {...form.getInputProps("mirror.group_one")}
                      key={form.key("mirror.group_one")}
                      label="Group 1 pricing mirror (optional)"
                      placeholder="Select distributor"
                      data={
                        mirrorOptions.map((mirror) => ({
                          value: mirror.value.toString(),
                          label: mirror.label,
                        })) || []
                      }
                      rightSection={<ChevronDownIcon />}
                      classNames={selectStyles}
                      clearable
                      searchable
                    />
                  </Grid.Col>
                  <Grid.Col span={{ sm: 6, base: 12 }}>
                    <Select
                      {...form.getInputProps("mirror.group_two")}
                      label="Group 2 pricing mirror (optional)"
                      placeholder="Select distributor"
                      data={
                        mirrorOptions.map((mirror) => ({
                          value: mirror.value.toString(),
                          label: mirror.label,
                        })) || []
                      }
                      rightSection={<ChevronDownIcon />}
                      classNames={selectStyles}
                      clearable
                      searchable
                    />
                  </Grid.Col>
                </Grid>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 mt-6">
              <h2 className="text-lg font-semibold mb-6">Co-efficients</h2>
              {Array.isArray(formData?.coefficients) &&
                formData?.coefficients.length > 0 && (
                  <CoefficientsTable
                    data={formData?.coefficients}
                    distributorId={formData.id}
                  />
                )}
              <Button
                variant="outline"
                className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                leftSection={<LucidePlusIcon size={24} />}
                onClick={open}
              >
                Add co-efficients
              </Button>
              {form.errors.coefficients && (
                <p className="text-xs text-[#fa5252]">
                  Co-effiencents is required
                </p>
              )}
            </div>

            <Group justify="flex-end" mt="xl" gap={10}>
              <Button
                variant="outline"
                className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                leftSection={<ExitIcon />}
              >
                Cancel
              </Button>
              <Button
                leftSection={isEdit ? <RefreshIcon /> : <PlusIcon />}
                type="submit"
                variant="outline"
                className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
              >
                {isEdit ? "Update" : "Create"}
              </Button>
            </Group>
          </form>
          <CoefficientsForm
            opened={opened}
            close={close}
            distributorId={formData?.id ?? undefined}
            form={form}
          />
        </>
      )}
    </>
  );
};

export default AddDistributorForm;
