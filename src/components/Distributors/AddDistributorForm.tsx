import { Currency, getCurrencies } from "@/api/get-currencies";
import {
  Button,
  Grid,
  Group,
  Loader,
  MultiSelect,
  Select,
  TextInput,
  ActionIcon,
  Checkbox,
  Table,
  Text,
  Modal,
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
import { Save, XIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useLayoutEffect, useState, useEffect } from "react";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import ExitIcon from "../Icons/ExitIcon";
import { selectStyles, textInputStyles } from "../Shared/Styles";
import ProductsTable from "./ProductsTable";
import CoefficientsTable from "./CoefficientsTable";
import { getDistributorBrands } from "@/api/distributors/get-brands";
import type { Brand } from "@/api/distributors/get-brands";
import { getBillingList } from "@/api/billingList/get-billing-list";
import { getPricingList } from "@/api/pricingList/get-pricing-list";
import { BrandProofUpload } from "./BrandProofUpload";
import { AddBrandForm } from "./AddBrandForm";
import { useDeleteBrandDistributor } from "@/api/distributors/delete-brands";
import { useAddBrandDistributors } from "@/api/distributors/add-brand-distributors";

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

// Helper to group brands by account type
interface GroupedBrand extends Brand {
  approved: boolean;
  proofs: { name: string; url: string }[];
  coefficientType: string;
  billingType: string;
}

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
            ? brand.proof.map((p: { name: string; url: string }) => ({
                name: p.name,
                url: p.url,
              }))
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
            ? brand.proof.map((p: { name: string; url: string }) => ({
                name: p.name,
                url: p.url,
              }))
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

  // State for products selection
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [bulkActionStatus, setBulkActionStatus] = useState<string | null>(null);

  // Add after marketedBrandGroups state
  const [brandProductSelections] = useState<Record<number, string>>({});

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
    } else {
      setMarketedBrandGroups([]);
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

  const [editBrand, setEditBrand] = useState<{
    brand: GroupedBrand;
    groupName: string;
  } | null>(null);
  const [deleteBrand, setDeleteBrand] = useState<{
    brand: GroupedBrand;
    groupName: string;
  } | null>(null);

  const [addBrandModal, setAddBrandModal] = useState<{
    open: boolean;
    groupName: string;
  } | null>(null);

  function toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .replace(/\s+/g, "_")
      .toLowerCase();
  }

  const addBrandDistributors = useAddBrandDistributors({});

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
              {marketedBrandGroups.map((group) => (
                <div
                  key={group.name}
                  className="mb-8 border-b pb-6 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Text fw={500} className="pl-2 text-base">
                      {group.name}
                    </Text>
                    <Button
                      size="xs"
                      onClick={() =>
                        setAddBrandModal({
                          open: true,
                          groupName: toSnakeCase(group.name),
                        })
                      }
                    >
                      + Add Brand
                    </Button>
                  </div>
                  <div className="overflow-x-auto w-full">
                    <Table
                      verticalSpacing="md"
                      highlightOnHover
                      className="min-w-[900px]"
                    >
                      <Table.Tbody>
                        {group.brands.map((brand) => (
                          <Table.Tr key={brand.id}>
                            {/* Brand Name */}
                            <Table.Td className="w-1/6 whitespace-nowrap max-w-[180px] truncate">
                              <Text size="sm" className="truncate">
                                {brand.name}
                              </Text>
                            </Table.Td>
                            {/* Brand Approval */}
                            <Table.Td className="w-[15%] whitespace-nowrap">
                              <Checkbox
                                checked={brand.approved}
                                disabled
                                label={
                                  brand.approved
                                    ? "Brand approved"
                                    : "Brand not approved"
                                }
                                classNames={{
                                  root: "flex items-center",
                                  input: "border-gray-300 bg-gray-200 h-5 w-5",
                                  label: "text-sm ml-2",
                                }}
                              />
                            </Table.Td>
                            {/* Upload Proof Button */}
                            <Table.Td className="w-[15%] whitespace-nowrap">
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
                                          (p: {
                                            name: string;
                                            url: string;
                                          }) => ({
                                            name: p.name,
                                            url: p.url,
                                          })
                                        ),
                                    type:
                                      brand.type || brand.coefficientType || "",
                                    pricing_id: brand.pricing?.id ?? null,
                                  }}
                                  onSuccess={handleBrandProofUploaded}
                                />
                              </Group>
                            </Table.Td>
                            {/* Proof Files List */}
                            <Table.Td className="w-1/4 whitespace-nowrap max-w-[220px] truncate">
                              <div className="flex flex-col items-start gap-1">
                                {brand.proofs.map(
                                  (
                                    proof: { name: string; url: string },
                                    proofIndex: number
                                  ) => (
                                    <div
                                      key={proofIndex}
                                      className="flex items-center gap-2 w-full max-w-[380px]"
                                    >
                                      <Text
                                        component="a"
                                        href={proof.url || "#"}
                                        onClick={(
                                          e: React.MouseEvent<HTMLAnchorElement>
                                        ) => {
                                          if (!proof.url) e.preventDefault();
                                        }}
                                        className="underline text-blue-600 hover:text-blue-800 cursor-pointer truncate max-w-[200px] inline-block"
                                        title={proof.name}
                                      >
                                        {proof.name}
                                      </Text>
                                      <ActionIcon
                                        size="sm"
                                        color="gray"
                                        variant="transparent"
                                        onClick={async () => {
                                          // Remove proof from local state
                                          const newGroups =
                                            marketedBrandGroups.map(
                                              (
                                                g: (typeof marketedBrandGroups)[number]
                                              ): (typeof marketedBrandGroups)[number] => {
                                                if (g.name === group.name) {
                                                  return {
                                                    ...g,
                                                    brands: g.brands.map(
                                                      (
                                                        b: GroupedBrand
                                                      ): GroupedBrand =>
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
                                                                    proofIndex
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

                                          // Find the updated brand from the newGroups state
                                          const updatedGroup = newGroups.find(
                                            (g) => g.name === group.name
                                          );
                                          const updatedBrand =
                                            updatedGroup?.brands.find(
                                              (b) => b.id === brand.id
                                            );
                                          if (!updatedBrand) return;

                                          // Send POST request with the updated brand (all fields, updated proofs)
                                          addBrandDistributors.mutate({
                                            distributorId,
                                            data: {
                                              brands: [
                                                {
                                                  category:
                                                    updatedBrand.category,
                                                  brand_id: updatedBrand.id,
                                                  approved:
                                                    updatedBrand.approved,
                                                  proof: updatedBrand.proofs, // send full objects
                                                  type:
                                                    updatedBrand.type ||
                                                    updatedBrand.coefficientType ||
                                                    "",
                                                  pricing_id:
                                                    updatedBrand.pricing?.id ??
                                                    null,
                                                },
                                              ],
                                            },
                                          });
                                        }}
                                      >
                                        <XIcon size={14} strokeWidth={1.5} />
                                      </ActionIcon>
                                    </div>
                                  )
                                )}
                              </div>
                            </Table.Td>
                            {/* Coefficient Select */}
                            <Table.Td className="w-1/6 whitespace-nowrap max-w-[160px] truncate">
                              <Text size="sm" className="truncate">
                                {brand.type
                                  ? coefficientOptions.find(
                                      (opt) => opt.value === brand.type
                                    )?.label || brand.type
                                  : coefficientOptions.find(
                                      (opt) =>
                                        opt.value === brand.coefficientType
                                    )?.label ||
                                    brand.coefficientType ||
                                    "-"}
                              </Text>
                            </Table.Td>
                            {/* Dynamic Product Select */}
                            <Table.Td className="w-1/6 whitespace-nowrap max-w-[220px] truncate">
                              <Text size="sm" className="truncate">
                                {brand.pricing?.name
                                  ? brand.pricing.name
                                  : brandProductSelections[brand.id] || "-"}
                              </Text>
                            </Table.Td>
                            {/* Edit Action */}
                            <Table.Td
                              className="w-[5%] text-center !pr-2 cursor-pointer whitespace-nowrap"
                              onClick={() =>
                                setEditBrand({ brand, groupName: group.name })
                              }
                            >
                              <PencilIcon className="size-5" />
                            </Table.Td>
                            {/* Delete Action */}
                            <Table.Td className="w-[5%] text-center !pr-2 cursor-pointer whitespace-nowrap">
                              <TrashIcon className="size-5" />
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </div>
                </div>
              ))}
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
          <EditBrandForm
            opened={!!editBrand}
            onClose={() => setEditBrand(null)}
            brand={editBrand?.brand || null}
            onSave={(updated: Partial<GroupedBrand>) => {
              if (!editBrand) return;
              const updatedGroups = marketedBrandGroups.map((g) => {
                if (g.name === editBrand.groupName) {
                  return {
                    ...g,
                    brands: g.brands.map((b) =>
                      b.id === editBrand.brand.id ? { ...b, ...updated } : b
                    ),
                  };
                }
                return g;
              });
              setMarketedBrandGroups(updatedGroups);

              // Find the updated brand from the newGroups state
              const updatedGroup = updatedGroups.find(
                (g) => g.name === editBrand.groupName
              );
              const updatedBrand = updatedGroup?.brands.find(
                (b) => b.id === editBrand.brand.id
              );
              if (!updatedBrand) return;
              addBrandDistributors.mutate({
                distributorId,
                data: {
                  brands: [
                    {
                      category: updatedBrand.category,
                      brand_id: updatedBrand.id,
                      approved: updatedBrand.approved,
                      proof: updatedBrand.proofs, // send full objects
                      type:
                        updatedBrand.type || updatedBrand.coefficientType || "",
                      pricing_id: updatedBrand.pricing?.id ?? null,
                    },
                  ],
                },
              });
            }}
          />
          <DeleteBrandModal
            opened={!!deleteBrand}
            onClose={() => setDeleteBrand(null)}
            distributorId={distributorId}
            brandId={deleteBrand?.brand?.id ?? null}
            onSuccess={() => setDeleteBrand(null)}
          />
          <AddBrandForm
            opened={!!addBrandModal?.open}
            close={() => setAddBrandModal(null)}
            distributorId={distributorId}
            category={addBrandModal?.groupName || ""}
            onSuccess={handleBrandProofUploaded}
          />
        </>
      )}
    </>
  );
};

function EditBrandForm({
  opened,
  onClose,
  brand,
  onSave,
}: {
  opened: boolean;
  onClose: () => void;
  brand: GroupedBrand | null;
  onSave: (updated: Partial<GroupedBrand>) => void;
}) {
  const [type, setType] = useState(brand?.type || brand?.coefficientType || "");
  const [brandId, setBrandId] = useState(brand?.id?.toString() || "");
  const [productId, setProductId] = useState(
    brand?.pricing?.id?.toString() || ""
  );
  const [isApproved, setIsApproved] = useState(brand?.approved || false);

  // Fetch products for selected brand and type
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["editProductsForBrandType", brandId, type],
    queryFn: async () => {
      if (!brandId || !type) return [];
      if (type === "billing") {
        const res = await getBillingList({
          page_size: 50,
        });
        // Map billing lists to match productOptions structure
        return res.data.map((b) => ({
          id: b.id,
          material_description: b.name,
        }));
      } else {
        const res = await getPricingList({
          page_size: 50,
        });
        // Map pricing lists to match productOptions structure
        return res.data.map((p) => ({
          id: p.id,
          material_description: p.name,
        }));
      }
    },
    enabled: !!brandId && !!type,
  });
  const productOptions =
    productsData?.map((p) => ({
      value: p.id.toString(),
      label: p.material_description,
    })) || [];

  useEffect(() => {
    setType(brand?.type || brand?.coefficientType || "");
    setBrandId(brand?.id?.toString() || "");
    setProductId(brand?.pricing?.id?.toString() || "");
    setIsApproved(brand?.approved || false);
  }, [brand]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      type,
      pricing: productId
        ? {
            id: Number(productId),
            name: "",
            type: "",
            description: "",
            createdAt: "",
          }
        : undefined,
      approved: isApproved,
    });
    onClose();
  }

  return (
    <Modal.Root
      opened={opened}
      onClose={onClose}
      withinPortal={false}
      trapFocus={false}
      className={opened ? "absolute top-0 left-0 h-full w-full" : "hidden"}
    >
      <Modal.Overlay
        bg="linear-gradient(180deg, rgba(0, 37, 84, 0.7) 0%, rgba(0, 235, 178, 0.7) 100%)"
        blur={3}
      />
      <Modal.Content className="!items-center min-w-[40%]">
        <Modal.Body>
          <div className="bg-white rounded-2xl p-6 mt-6">
            <h2 className="text-xl font-semibold mb-6 text-primary">
              Edit Brand
            </h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Select
                value={brand?.id?.toString() || ""}
                data={
                  brand
                    ? [{ value: brand.id.toString(), label: brand.name }]
                    : []
                }
                label="Brand"
                classNames={selectStyles}
                disabled
              />
              <Select
                value={type}
                onChange={(val) => {
                  setType(val || "");
                  setProductId("");
                }}
                data={coefficientOptions}
                label="Type"
                placeholder="Select type"
                classNames={selectStyles}
                required
              />
              <Select
                value={productId}
                onChange={(val) => setProductId(val || "")}
                data={productOptions}
                label="Product"
                placeholder={
                  isLoadingProducts ? "Loading..." : "Select product"
                }
                classNames={selectStyles}
                required
                searchable
                disabled={!brandId || !type || isLoadingProducts}
              />
              <Checkbox
                checked={isApproved}
                onChange={(e) => setIsApproved(e.currentTarget.checked)}
                label="Approved"
              />
              <Group justify="flex-end" gap={10}>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!type || !productId}>
                  Save
                </Button>
              </Group>
            </form>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}

function DeleteBrandModal({
  opened,
  onClose,
  distributorId,
  brandId,
  onSuccess,
}: {
  opened: boolean;
  onClose: () => void;
  distributorId: string | number;
  brandId: string | number | null;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const deleteBrandMutation = useDeleteBrandDistributor({
    mutationConfig: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["brands", distributorId] });
        onSuccess?.();
        onClose();
      },
    },
  });
  function handleDelete() {
    if (brandId) {
      deleteBrandMutation.mutate({ distributorId, brandId });
    }
  }
  return (
    <Modal.Root
      opened={opened}
      onClose={onClose}
      withinPortal={false}
      trapFocus={false}
      className={opened ? "absolute top-0 left-0 h-full w-full" : "hidden"}
    >
      <Modal.Overlay
        bg="linear-gradient(180deg, rgba(0, 37, 84, 0.7) 0%, rgba(0, 235, 178, 0.7) 100%)"
        blur={3}
      />
      <Modal.Content className="!items-center min-w-[40%]">
        <Modal.Body>
          <div className="bg-white rounded-2xl p-6 ">
            <h2 className="text-xl font-semibold mb-6 text-primary">
              Delete Brand
            </h2>
            <p className="mb-4">Are you sure you want to delete this brand?</p>
            <div className="space-y-6">
              <Group justify="flex-end" mt="xl" gap={10}>
                <Button
                  variant="outline"
                  className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
                  onClick={onClose}
                  disabled={deleteBrandMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
                  onClick={handleDelete}
                  loading={deleteBrandMutation.isPending}
                  color="red"
                >
                  Delete
                </Button>
              </Group>
            </div>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}

export default AddDistributorForm;
