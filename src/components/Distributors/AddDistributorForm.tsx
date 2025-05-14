import { Currency, getCurrencies } from "@/api/get-currencies";
import {
  Button,
  Grid,
  Group,
  Loader,
  MultiSelect,
  Select,
  TextInput,
  Accordion,
  ActionIcon,
  Checkbox,
  Table,
  Text,
} from "@mantine/core";

import { useAddDistributor } from "@/api/distributors/add-distributor";
import {
  updateDistributorInput,
  updateDistributorInputSchema,
  useUpdateDistributor,
} from "@/api/distributors/update-distributor";
import { getRegions } from "@/api/get-regions";
import { getCategories } from "@/api/listManagement/coreCategories/get-categories";
import { getMarkets } from "@/api/listManagement/markets/get-markets";
import { Distributor, Pref } from "@/types";
import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useQueries } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { CheckIcon, XIcon } from "lucide-react";
import { useLayoutEffect, useState, useEffect } from "react";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import ExitIcon from "../Icons/ExitIcon";
import PlusIcon from "../Icons/PlusIcon";
import RefreshIcon from "../Icons/RefreshIcon";
import { selectStyles, textInputStyles } from "../Shared/Styles";
import CoefficientsTable from "./CoefficientsTable";
import ProductsTable from "./ProductsTable";

export type FormValues = updateDistributorInput & {
  coefficients: Array<{
    value: string;
    brand_id: number;
    category_id: number;
    pref: Pref;
  }>;
};

const accountTypes = [
  { value: "luxury", label: "Luxury" },
  { value: "consumer_beauty", label: "Consumer Beauty" },
];

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

  // --- START Hardcoded Data for Marketed Brands ---
  const initialMarketedBrandGroups = [
    {
      name: "Group 1",
      brands: [
        {
          id: "calvin-klein",
          name: "Calvin Klein",
          approved: true,
          proofs: ["Proof email.pdf", "Proof document 2.jpeg"],
          coefficientType: "co-efficient",
          billingType: "lux-french-rrsp",
        },
        {
          id: "hugo-boss",
          name: "Hugo Boss",
          approved: true,
          proofs: ["Proof email.pdf"],
          coefficientType: "billing",
          billingType: "lux-billing",
        },
      ],
    },
    {
      name: "Group 2",
      brands: [
        {
          id: "davidoff-1",
          name: "Davidoff",
          approved: true,
          proofs: ["Proof email.pdf"],
          coefficientType: "billing",
          billingType: "lux-billing",
        },
        {
          id: "chloe",
          name: "Chloe",
          approved: true,
          proofs: ["Proof email.pdf"],
          coefficientType: "billing",
          billingType: "lux-billing",
        },
        {
          id: "escada",
          name: "Escada",
          approved: true,
          proofs: ["Proof email.pdf"],
          coefficientType: "billing",
          billingType: "lux-billing",
        },
      ],
    },
    {
      name: "Group 3",
      brands: [
        {
          id: "davidoff-2",
          name: "Davidoff",
          approved: true,
          proofs: ["Proof email.pdf"],
          coefficientType: "billing",
          billingType: "lux-billing",
        },
      ],
    },
  ];

  const coefficientOptions = [
    { value: "co-efficient", label: "Co-efficient" },
    { value: "billing", label: "Billing" },
  ];

  const billingOptions = [
    { value: "lux-french-rrsp", label: "Lux French RRSP $" },
    { value: "lux-billing", label: "Lux Billing $" },
    { value: "cb-french-rrsp", label: "CB French RRSP $" },
    { value: "cb-billing", label: "CB Billing $" },
  ];

  // --- END Hardcoded Data for Marketed Brands ---

  // --- START Consumer Beauty Marketed Brands Data ---
  const consumerBeautyMarketedBrandGroupsData = [
    {
      name: "Colour cosmetics",
      brands: [
        {
          id: "bourjois",
          name: "Bourjois",
          approved: true,
          proofs: ["Proof email.pdf", "Proof document 2.jpeg"],
          coefficientType: "co-efficient",
          billingType: "cb-french-rrsp",
        },
        {
          id: "kyle",
          name: "Kyle",
          approved: true,
          proofs: ["Proof email.pdf"],
          coefficientType: "billing",
          billingType: "cb-billing",
        },
      ],
    },
    {
      name: "Mass fragrance",
      brands: [
        {
          id: "adidas",
          name: "Adidas",
          approved: true,
          proofs: ["Proof email.pdf"],
          coefficientType: "billing",
          billingType: "lux-french-rrsp",
        },
        {
          id: "beckham",
          name: "Beckham",
          approved: true,
          proofs: ["Proof email.pdf"],
          coefficientType: "billing",
          billingType: "lux-french-rrsp",
        },
        {
          id: "another-name",
          name: "Another name",
          approved: true,
          proofs: ["Proof email.pdf"],
          coefficientType: "billing",
          billingType: "lux-french-rrsp",
        },
      ],
    },
  ];
  // --- END Consumer Beauty Marketed Brands Data ---

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, { open }] = useDisclosure(false);

  // State for marketed brands
  const [marketedBrandGroups, setMarketedBrandGroups] = useState(
    initialMarketedBrandGroups
  );
  const [accordionValue, setAccordionValue] = useState<string[]>(
    initialMarketedBrandGroups.map((g) => g.name)
  );

  // State for products selection
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [bulkActionStatus, setBulkActionStatus] = useState<string | null>(null);

  // Handler for main checkbox
  const handleSelectAllChange = (checked: boolean, products: number[]) => {
    setSelectedProducts(checked ? products : []);
  };

  // Handler for individual checkbox
  const handleRowCheckboxChange = (productId: number, checked: boolean) => {
    setSelectedProducts((prev) =>
      checked ? [...prev, productId] : prev.filter((id) => id !== productId)
    );
  };

  // Handler for applying bulk action
  const handleApplyBulkAction = () => {
    setSelectedProducts([]);
    setBulkActionStatus(null);
  };

  const [
    { data: marketsData },
    { data: regionsData },
    { data: categoriesData },
    { data: currenciesData },
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
      { queryKey: ["currencies"], queryFn: getCurrencies },
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

  // Effect to switch marketed brands based on account type
  useEffect(() => {
    if (form.values.type === "consumer_beauty") {
      const currentConsumerBeautyGroups = consumerBeautyMarketedBrandGroupsData;
      setMarketedBrandGroups(currentConsumerBeautyGroups);
      setAccordionValue(currentConsumerBeautyGroups.map((group) => group.name));
    } else {
      // Default to luxury or handle other types if needed
      const currentInitialGroups = initialMarketedBrandGroups;
      setMarketedBrandGroups(currentInitialGroups);
      setAccordionValue(currentInitialGroups.map((group) => group.name));
    }
    // Resetting accordion state when type changes might be needed depending on Accordion implementation
    // Resetting selection state or other related states might also be needed
  }, [form.values.type]);

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
              <h2 className="text-lg font-semibold mb-6">
                Distributor details
              </h2>
              <div className="space-y-6">
                <Grid gutter={24}>
                  <Grid.Col span={{ sm: 6, base: 12 }}>
                    <span className="text-primary font-medium text-sm mb-2 block">
                      Account type
                    </span>
                    <Select
                      {...form.getInputProps("type")}
                      placeholder="Select account type"
                      data={accountTypes}
                      rightSection={<ChevronDownIcon />}
                      classNames={selectStyles}
                      clearable
                      searchable
                      className="w-full"
                    />
                  </Grid.Col>
                </Grid>

                <Grid gutter={24}>
                  <Grid.Col span={{ base: 12 }}>
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
                    <TextInput
                      {...form.getInputProps("company_registration_number")}
                      label="SAP Account Number "
                      placeholder="Enter SAP Account Number"
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
                      classNames={{
                        ...selectStyles,
                        pill: "bg-[#0F62FE] text-white my-auto rounded-full px-2.5 mt-0.5 text-xs font-medium flex items-center",
                      }}
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
                      classNames={{
                        ...selectStyles,
                        pill: "bg-[#0F62FE] text-white rounded-full px-2.5 mt-0.5 text-xs font-medium flex items-center",
                      }}
                      clearable
                      searchable
                      autoComplete="off"
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
                      classNames={{
                        ...selectStyles,
                        pill: "bg-[#0F62FE] text-white rounded-full px-2.5 mt-0.5 text-xs font-medium flex items-center",
                      }}
                      clearable
                      searchable
                    />
                  </Grid.Col>
                </Grid>

                <Grid gutter={24}>
                  {/* <Grid.Col span={{ sm: 6, base: 12 }}>
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
                  </Grid.Col> */}
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

              {form.errors.coefficients && (
                <p className="text-xs text-[#fa5252]">
                  Co-effiencents is required
                </p>
              )}
            </div>
            {/* START: Marketed COTY Brands Section */}
            <div className="bg-white rounded-2xl p-6 mt-6">
              <h2 className="text-lg font-semibold mb-4">
                Marketed COTY brands
              </h2>
              <Accordion
                variant="separated"
                classNames={{
                  item: "bg-white border !rounded-xl overflow-hidden mb-4",
                  control: "hover:bg-gray-50",
                  content: "pt-0 pb-0 ",
                  chevron: " [& > svg]:w-6 [& > svg]:h-6 ",
                }}
                styles={{
                  control: { padding: "1rem" },
                  item: { border: "1px solid #e0e0e0" },
                  content: { paddingLeft: "0", paddingRight: "0" },
                }}
                multiple
                value={accordionValue}
                onChange={setAccordionValue}
              >
                {marketedBrandGroups.map((group) => (
                  <div key={group.name} className="mb-4">
                    <Text fw={500} mb="xs" className="pl-4">
                      {group.name}
                    </Text>
                    <Accordion.Item value={group.name}>
                      <Accordion.Control className="h-16 bg-gray-100">
                        <div className="flex items-center w-full">
                          <button className="text-primary ">
                            Select brands
                          </button>
                        </div>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Table verticalSpacing="md" highlightOnHover>
                          <Table.Tbody>
                            {group.brands.map((brand) => (
                              <Table.Tr key={brand.id}>
                                {/* Brand Name */}
                                <Table.Td className="w-1/6">
                                  <Text size="sm">{brand.name}</Text>
                                </Table.Td>

                                {/* Brand Approval */}
                                <Table.Td className="w-[15%]">
                                  <Checkbox
                                    checked={brand.approved}
                                    label="Brand approval"
                                    classNames={{
                                      root: "flex items-center",
                                      input:
                                        "border-gray-300 bg-gray-200 h-5 w-5",
                                      label: "text-sm ml-2",
                                      icon: "text-blue-500 ",
                                    }}
                                    icon={({ ...others }) => (
                                      <CheckIcon {...others} />
                                    )}
                                    onChange={(event) => {
                                      const newGroups = marketedBrandGroups.map(
                                        (g) => {
                                          if (g.name === group.name) {
                                            return {
                                              ...g,
                                              brands: g.brands.map((b) =>
                                                b.id === brand.id
                                                  ? {
                                                      ...b,
                                                      approved:
                                                        event.currentTarget
                                                          .checked,
                                                    }
                                                  : b
                                              ),
                                            };
                                          }
                                          return g;
                                        }
                                      );
                                      setMarketedBrandGroups(newGroups);
                                    }}
                                  />
                                </Table.Td>

                                {/* Upload Proof Button */}
                                <Table.Td className="w-[15%]">
                                  <Group gap="xs" align="center">
                                    <button className="bg-primary rounded-md text-white p-1 text-sm">
                                      Upload proof
                                    </button>
                                  </Group>
                                </Table.Td>

                                {/* Proof Files List */}
                                <Table.Td className="w-1/4">
                                  <div className="flex flex-col items-start gap-1">
                                    {brand.proofs.map(
                                      (proof: string, index: number) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-2"
                                        >
                                          <Text
                                            component="a"
                                            href="#"
                                            onClick={(e) => e.preventDefault()}
                                            className="underline text-blue-600 hover:text-blue-800 cursor-pointer"
                                          >
                                            {proof}
                                          </Text>
                                          <ActionIcon
                                            size="sm"
                                            color="gray"
                                            variant="transparent"
                                            onClick={() => {
                                              const newGroups =
                                                marketedBrandGroups.map((g) => {
                                                  if (g.name === group.name) {
                                                    return {
                                                      ...g,
                                                      brands: g.brands.map(
                                                        (b) =>
                                                          b.id === brand.id
                                                            ? {
                                                                ...b,
                                                                proofs:
                                                                  b.proofs.filter(
                                                                    (_, i) =>
                                                                      i !==
                                                                      index
                                                                  ),
                                                              }
                                                            : b
                                                      ),
                                                    };
                                                  }
                                                  return g;
                                                });
                                              setMarketedBrandGroups(newGroups);
                                            }}
                                          >
                                            <XIcon
                                              size={14}
                                              strokeWidth={1.5}
                                            />
                                          </ActionIcon>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </Table.Td>

                                {/* Coefficient Select */}
                                <Table.Td className="w-1/6">
                                  <Select
                                    value={brand.coefficientType as string}
                                    data={coefficientOptions}
                                    rightSection={<ChevronDownIcon />}
                                    classNames={{
                                      ...selectStyles,
                                      input: `${selectStyles.input} text-sm`,
                                    }}
                                    size="sm"
                                    onChange={(value) => {
                                      const newGroups = marketedBrandGroups.map(
                                        (g) => {
                                          if (g.name === group.name) {
                                            return {
                                              ...g,
                                              brands: g.brands.map((b) =>
                                                b.id === brand.id
                                                  ? {
                                                      ...b,
                                                      coefficientType:
                                                        value || "",
                                                    }
                                                  : b
                                              ),
                                            };
                                          }
                                          return g;
                                        }
                                      );
                                      setMarketedBrandGroups(newGroups);
                                    }}
                                  />
                                </Table.Td>

                                {/* Billing Select */}
                                <Table.Td className="w-1/6">
                                  <Select
                                    value={brand.billingType as string}
                                    data={billingOptions}
                                    rightSection={<ChevronDownIcon />}
                                    classNames={{
                                      ...selectStyles,
                                      input: `${selectStyles.input} text-sm`,
                                    }}
                                    size="sm"
                                    onChange={(value) => {
                                      const newGroups = marketedBrandGroups.map(
                                        (g) => {
                                          if (g.name === group.name) {
                                            return {
                                              ...g,
                                              brands: g.brands.map((b) =>
                                                b.id === brand.id
                                                  ? {
                                                      ...b,
                                                      billingType: value || "",
                                                    }
                                                  : b
                                              ),
                                            };
                                          }
                                          return g;
                                        }
                                      );
                                      setMarketedBrandGroups(newGroups);
                                    }}
                                  />
                                </Table.Td>

                                {/* Delete Row Action */}
                                <Table.Td className="w-[5%] text-right">
                                  <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    onClick={() => {
                                      const newGroups = marketedBrandGroups.map(
                                        (g) => {
                                          if (g.name === group.name) {
                                            return {
                                              ...g,
                                              brands: g.brands.filter(
                                                (b) => b.id !== brand.id
                                              ),
                                            };
                                          }
                                          return g;
                                        }
                                      );
                                      setMarketedBrandGroups(newGroups);
                                    }}
                                  >
                                    <XIcon size={18} />
                                  </ActionIcon>
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </div>
                ))}
              </Accordion>
            </div>
            {/* END: Marketed COTY Brands Section */}

            {formData?.id && (
              <ProductsTable
                distributorId={formData.id}
                selectedProducts={selectedProducts}
                bulkActionStatus={bulkActionStatus}
                onBulkActionChange={setBulkActionStatus}
                onApplyBulkAction={handleApplyBulkAction}
                onSelectAllChange={handleSelectAllChange}
                onRowCheckboxChange={handleRowCheckboxChange}
              />
            )}

            {/* Comment out Pricing rules section */}
            {/*
            <div className="bg-white rounded-2xl p-6 mt-6">
              <h2 className="text-lg font-semibold mb-6">Pricing rules</h2>
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
                      data={[]}
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
                      data={[]}
                      rightSection={<ChevronDownIcon />}
                      classNames={selectStyles}
                      clearable
                      searchable
                    />
                  </Grid.Col>
                </Grid>
              </div>
            </div>
            */}

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
          {/* <CoefficientsForm
            opened={opened}
            close={close}
            distributorId={formData?.id ?? undefined}
            form={form}
          />
          <ProductBindingForm
            opened={productBindingOpened}
            close={closeProductBinding}
            distributorId={formData?.id ?? undefined}
            form={form}
          /> */}
        </>
      )}
    </>
  );
};

export default AddDistributorForm;
