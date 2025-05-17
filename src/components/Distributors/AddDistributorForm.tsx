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
  UpdateDistributorInput,
  updateDistributorInputSchema,
  useUpdateDistributor,
} from "@/api/distributors/update-distributor";
import { getRegions } from "@/api/get-regions";
import { getCategories } from "@/api/listManagement/coreCategories/get-categories";
import { getMarkets } from "@/api/listManagement/markets/get-markets";
import { Distributor } from "@/types";
import { useForm, zodResolver } from "@mantine/form";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { CheckIcon, Save, XIcon } from "lucide-react";
import { useLayoutEffect, useState, useEffect } from "react";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import ExitIcon from "../Icons/ExitIcon";
import { selectStyles, textInputStyles } from "../Shared/Styles";
import ProductsTable from "./ProductsTable";
import CoefficientsTable from "./CoefficientsTable";
import { getDistributorBrands } from "@/api/distributors/get-brands";
import type { Brand } from "@/api/distributors/get-brands";
import { getBillingProductList } from "@/api/billingList/get-billing-product-list";
import { getPricingProductList } from "@/api/pricingList/get-pricing-product-list";
import { BrandProofUpload } from "./BrandProofUpload";

export type FormValues = UpdateDistributorInput & {
  coefficients: Array<{
    type: "regular" | "giftset" | "tester";
    pref_value: string;
    non_pref_value?: string;
    brand_id: number;
    category_id: number;
    description?: string;
  }>;
  brands: string[];
};

const accountTypeCategories = [
  { value: "luxury", label: "Luxury" },
  { value: "consumer beauty", label: "Consumer Beauty" },
];

const coefficientOptions = [
  { value: "co-efficient", label: "Co-efficient" },
  { value: "billing", label: "Billing" },
];

const consumerBeautyCategoryDisplayNames: Record<string, string> = {
  colour_cosmetics: "Colour cosmetics",
  mass_fragrance: "Mass fragrance",
};

const luxuryGroupDisplayNames: Record<string, string> = {
  group_1: "Group 1",
  group_2: "Group 2",
  group_3: "Group 3",
};

const AddDistributorForm = ({
  isEdit = false,
  formData,
  distributorId,
}: {
  isEdit?: boolean;
  formData?: Distributor;
  distributorId: string;
}) => {
  const form = useForm<FormValues>({
    validate: zodResolver(updateDistributorInputSchema),
  });
  const navigate = useNavigate();
  const [hasChanges, setHasChanges] = useState(false);
  const queryClient = useQueryClient();

  const resetForm = () => {
    if (formData) {
      const formValues: FormValues = {
        type: formData.type,
        account_type: "luxury", // Default to luxury if not specified
        name: formData.name,
        company_registration_number: formData.company_registration_number,
        contact_person: formData.contact_person,
        contact_email: formData.contact_email,
        currency: formData.currency,
        regions: formData.regions.map((region) => region.id.toString()),
        categories: formData.categories.map((category) =>
          category.id.toString()
        ),
        markets: formData.markets.map((market) => market.id.toString()),
        brands: formData.brands.map((brand) => brand.id.toString()),
        coefficients: formData.coefficients.map((coefficient) => ({
          type: coefficient.type,
          pref_value: coefficient.pref_value,
          non_pref_value: coefficient.non_pref_value,
          brand_id: coefficient.brand.id,
          category_id: coefficient.category.id,
          description: coefficient.description,
        })),
      };
      form.setValues(formValues);
      setHasChanges(false);
    }
  };

  // Track form changes
  useEffect(() => {
    if (isEdit && formData) {
      const hasFormChanges =
        form.values.type !== formData.type ||
        form.values.name !== formData.name ||
        form.values.company_registration_number !==
          formData.company_registration_number ||
        form.values.contact_person !== formData.contact_person ||
        form.values.contact_email !== formData.contact_email ||
        form.values.currency !== formData.currency ||
        JSON.stringify(form.values.regions) !==
          JSON.stringify(formData.regions.map((r) => r.id.toString())) ||
        JSON.stringify(form.values.markets) !==
          JSON.stringify(formData.markets.map((m) => m.id.toString())) ||
        JSON.stringify(form.values.categories) !==
          JSON.stringify(formData.categories.map((c) => c.id.toString()));

      setHasChanges(hasFormChanges);
    }
  }, [form.values, formData, isEdit]);

  // Helper to group brands by account type
  interface GroupedBrand extends Brand {
    approved: boolean;
    proofs: string[];
    coefficientType: string;
    billingType: string;
  }

  function normalizeAccountType(type: string | undefined | null): string {
    return (type || "").replace(/\s+/g, "_").toLowerCase();
  }

  function groupBrandsByAccountType(
    brands: Brand[] = [],
    accountType: string
  ): { name: string; brands: GroupedBrand[] }[] {
    const normalizedType = normalizeAccountType(accountType);
    if (normalizedType === "consumer_beauty") {
      const groups: Record<string, GroupedBrand[]> = {};
      brands.forEach((brand: Brand) => {
        const category = brand.category || "Other";
        if (!groups[category]) groups[category] = [];
        groups[category].push({
          ...brand,
          approved: brand.approved ?? false,
          proofs: Array.isArray(brand.proof)
            ? brand.proof.map((p: { name: string }) => p.name)
            : [],
          coefficientType: "",
          billingType: "",
        });
      });
      return Object.entries(groups).map(([category, brands]) => ({
        name: consumerBeautyCategoryDisplayNames[category] || "Other",
        brands,
      }));
    } else {
      // Group by category for luxury
      const groups: Record<string, GroupedBrand[]> = {};
      brands.forEach((brand: Brand) => {
        const category = brand.category || "other";
        if (!groups[category]) groups[category] = [];
        groups[category].push({
          ...brand,
          approved: brand.approved ?? false,
          proofs: Array.isArray(brand.proof)
            ? brand.proof.map((p: { name: string }) => p.name)
            : [],
          coefficientType: "",
          billingType: "",
        });
      });
      return Object.entries(groups).map(([category, brands]) => ({
        name: luxuryGroupDisplayNames[category] || "Other",
        brands,
      }));
    }
  }

  // State for marketed brands
  const [marketedBrandGroups, setMarketedBrandGroups] = useState<
    { name: string; brands: GroupedBrand[] }[]
  >([]);
  const [accordionValue, setAccordionValue] = useState<string[]>([]);

  // State for products selection
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [bulkActionStatus, setBulkActionStatus] = useState<string | null>(null);

  // Add after marketedBrandGroups state
  const [brandProductSelections, setBrandProductSelections] = useState<
    Record<number, string>
  >({});

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

  const { data: brandsData } = useQuery({
    queryKey: ["brands", distributorId],
    queryFn: () => getDistributorBrands(Number(distributorId)),
  });

  console.log("brandsData", brandsData);

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
        coefficients: (formData.coefficients || [])
          .filter((coefficient) => coefficient.brand && coefficient.category)
          .map((coefficient) => ({
            type: coefficient.type,
            pref_value: coefficient.pref_value,
            non_pref_value: coefficient.non_pref_value,
            brand_id: coefficient.brand?.id ?? 0,
            category_id: coefficient.category?.id ?? 0,
            description: coefficient.description,
          })),
      });
    }
  }, [formData, isEdit]);

  // Update marketedBrandGroups when brandsData or account_type changes
  useEffect(() => {
    if (brandsData?.data) {
      const groups = groupBrandsByAccountType(
        brandsData.data,
        String(form.values.account_type || "luxury")
      );
      setMarketedBrandGroups(groups);
      setAccordionValue(groups.map((g) => g.name).filter(Boolean));
    } else {
      setMarketedBrandGroups([]);
      setAccordionValue([]);
    }
  }, [brandsData, form.values.account_type]);

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

  function handleBrandProofUploaded() {
    queryClient.invalidateQueries({ queryKey: ["brands", distributorId] });
  }

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
                // For update, pass coefficients as-is (form structure)
                updateDistributorMutations.mutate({
                  distributorId: formData?.id as number,
                  data: {
                    type: values.type,
                    account_type: values.account_type as
                      | "luxury"
                      | "consumer beauty",
                    name: values.name,
                    company_registration_number:
                      values.company_registration_number,
                    contact_person: values.contact_person,
                    regions: values.regions,
                    markets: values.markets,
                    contact_email: values.contact_email,
                    categories: values.categories,
                    currency: values.currency,
                    coefficients: values.coefficients,
                  },
                });
              } else {
                // Defensive: transform coefficients for API (add only)
                const apiCoefficients = (values.coefficients || []).flatMap(
                  (c) => {
                    const arr = [
                      {
                        value: c.pref_value,
                        brand_id: c.brand_id,
                        category_id: c.category_id,
                        pref: "pref" as "pref" | "non-pref",
                      },
                    ];
                    if (c.non_pref_value) {
                      arr.push({
                        value: c.non_pref_value,
                        brand_id: c.brand_id,
                        category_id: c.category_id,
                        pref: "non-pref" as "pref" | "non-pref",
                      });
                    }
                    return arr;
                  }
                );
                addDistributorMutations.mutate({
                  data: {
                    type: values.type,
                    name: values.name,
                    regions: values.regions || [],
                    markets: values.markets || [],
                    company_registration_number:
                      values.company_registration_number,
                    contact_person: values.contact_person,
                    contact_email: values.contact_email,
                    categories: values.categories || [],
                    brands: values.brands || [],
                    currency: values.currency,
                    coefficients: apiCoefficients,
                  },
                });
              }
            })}
            className="mt-2 sm:mt-5"
          >
            <div className="bg-white rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Distributor details</h2>
                {isEdit && (
                  <Group gap={10}>
                    {hasChanges && (
                      <Button
                        variant="outline"
                        className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
                        leftSection={<ExitIcon />}
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      leftSection={<Save className="size-4" />}
                      type="submit"
                      variant="outline"
                      className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-primary/90 hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    >
                      Save Changes
                    </Button>
                  </Group>
                )}
              </div>
              <div className="space-y-6">
                <Grid gutter={24}>
                  <Grid.Col span={{ sm: 6, base: 12 }}>
                    <span className="text-primary font-medium text-sm mb-2 block">
                      Account category
                    </span>
                    <Select
                      {...form.getInputProps("account_type")}
                      placeholder="Select account category"
                      data={accountTypeCategories}
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

              <CoefficientsTable distributorId={formData?.id || 0} />

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
                          <span className="text-primary ">Select brands</span>
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
                                      const newGroups: typeof marketedBrandGroups =
                                        marketedBrandGroups.map(
                                          (
                                            g
                                          ): (typeof marketedBrandGroups)[number] => {
                                            if (g.name === group.name) {
                                              return {
                                                ...g,
                                                brands: g.brands.map(
                                                  (b): GroupedBrand =>
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
                                    <BrandProofUpload
                                      distributorId={distributorId}
                                      brand={{
                                        category: brand.category,
                                        brand_id: brand.id,
                                        approved: brand.approved,
                                        proof: Array.isArray(brand.proof)
                                          ? brand.proof.map((p) => ({
                                              name: p.name,
                                              url: p.url,
                                            }))
                                          : (brand.proofs || []).map(
                                              (p: string) => ({
                                                name: p,
                                                url: "",
                                              })
                                            ),
                                        type:
                                          brand.type ||
                                          brand.coefficientType ||
                                          "",
                                        pricing_id: brand.pricing?.id ?? null,
                                      }}
                                      onSuccess={handleBrandProofUploaded}
                                    />
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
                                            onClick={(
                                              e: React.MouseEvent<HTMLAnchorElement>
                                            ) => e.preventDefault()}
                                            className="underline text-blue-600 hover:text-blue-800 cursor-pointer"
                                          >
                                            {proof}
                                          </Text>
                                          <ActionIcon
                                            size="sm"
                                            color="gray"
                                            variant="transparent"
                                            onClick={() => {
                                              const newGroups: typeof marketedBrandGroups =
                                                marketedBrandGroups.map(
                                                  (
                                                    g
                                                  ): (typeof marketedBrandGroups)[number] => {
                                                    if (g.name === group.name) {
                                                      return {
                                                        ...g,
                                                        brands: g.brands.map(
                                                          (b): GroupedBrand =>
                                                            b.id === brand.id
                                                              ? {
                                                                  ...b,
                                                                  proofs:
                                                                    b.proofs.filter(
                                                                      (
                                                                        _,
                                                                        i: number
                                                                      ) =>
                                                                        i !==
                                                                        index
                                                                    ),
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
                                    value={
                                      brand.type
                                        ? brand.type
                                        : brand.coefficientType || undefined
                                    }
                                    data={coefficientOptions}
                                    placeholder="Select type"
                                    rightSection={<ChevronDownIcon />}
                                    classNames={{
                                      ...selectStyles,
                                      input: `${selectStyles.input} text-sm`,
                                    }}
                                    size="sm"
                                    onChange={
                                      brand.type
                                        ? undefined
                                        : (value: string | null) => {
                                            const newGroups: typeof marketedBrandGroups =
                                              marketedBrandGroups.map(
                                                (
                                                  g
                                                ): (typeof marketedBrandGroups)[number] => {
                                                  if (g.name === group.name) {
                                                    return {
                                                      ...g,
                                                      brands: g.brands.map(
                                                        (b): GroupedBrand =>
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
                                            setBrandProductSelections(
                                              (prev) => ({
                                                ...prev,
                                                [brand.id]: "",
                                              })
                                            );
                                          }
                                    }
                                    disabled={!!brand.type}
                                  />
                                </Table.Td>

                                {/* Dynamic Product Select */}
                                <Table.Td className="w-1/6">
                                  {(brand.type === "billing" ||
                                    (!brand.type &&
                                      brand.coefficientType === "billing")) && (
                                    <BillingProductSelect
                                      brandId={brand.id}
                                      value={
                                        brandProductSelections[brand.id] || ""
                                      }
                                      onChange={(value) => {
                                        if (value)
                                          setBrandProductSelections((prev) => ({
                                            ...prev,
                                            [brand.id]: value,
                                          }));
                                      }}
                                    />
                                  )}
                                  {(brand.type === "co-efficient" ||
                                    (!brand.type &&
                                      brand.coefficientType ===
                                        "co-efficient")) && (
                                    <PricingProductSelect
                                      brandId={brand.id}
                                      value={
                                        brandProductSelections[brand.id] || ""
                                      }
                                      onChange={(value) => {
                                        if (value)
                                          setBrandProductSelections((prev) => ({
                                            ...prev,
                                            [brand.id]: value,
                                          }));
                                      }}
                                    />
                                  )}
                                </Table.Td>

                                {/* <Table.Td className="w-1/6">
                                  <Select
                                    value={brand.billingType as string}
                                    data={billingOptions}
                                    rightSection={<ChevronDownIcon />}
                                    classNames={{
                                      ...selectStyles,
                                      input: `${selectStyles.input} text-sm`,
                                    }}
                                    size="sm"
                                    onChange={(value: string | null) => {
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
                                </Table.Td> */}

                                {/* Delete Row Action */}
                                <Table.Td className="w-[5%] text-right">
                                  <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    onClick={() => {
                                      const newGroups: typeof marketedBrandGroups =
                                        marketedBrandGroups.map(
                                          (
                                            g
                                          ): (typeof marketedBrandGroups)[number] => {
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
          </form>
        </>
      )}
    </>
  );
};

interface ProductSelectProps {
  brandId: number;
  value: string;
  onChange: (val: string) => void;
}

function BillingProductSelect({
  brandId,
  value,
  onChange,
}: ProductSelectProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["billing-products", brandId],
    queryFn: () =>
      getBillingProductList({ brand_ids: [brandId], page_size: 50 }),
    enabled: !!brandId,
  });
  const options = (data?.data || []).map((p) => ({
    value: p.id.toString(),
    label: p.material_description,
  }));
  return (
    <Select
      value={value}
      data={options}
      onChange={(val) => {
        if (val) onChange(val);
      }}
      placeholder={isLoading ? "Loading..." : "Select product"}
      classNames={{
        ...selectStyles,
        input: `${selectStyles.input} text-sm min-w-[180px] max-w-[320px]`,
      }}
      searchable
      clearable
      rightSection={<ChevronDownIcon />}
      className="w-full"
    />
  );
}

function PricingProductSelect({
  brandId,
  value,
  onChange,
}: ProductSelectProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["pricing-products", brandId],
    queryFn: () =>
      getPricingProductList({ brand_ids: [brandId], page_size: 50 }),
    enabled: !!brandId,
  });
  const options = (data?.data || []).map((p) => ({
    value: p.id.toString(),
    label: p.material_description,
  }));
  return (
    <Select
      value={value}
      data={options}
      onChange={(val) => {
        if (val) onChange(val);
      }}
      placeholder={isLoading ? "Loading..." : "Select product"}
      classNames={{
        ...selectStyles,
        input: `${selectStyles.input} text-sm min-w-[180px] max-w-[320px]`,
      }}
      searchable
      clearable
      rightSection={<ChevronDownIcon />}
      className="w-full"
    />
  );
}

export default AddDistributorForm;
