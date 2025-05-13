import {
  Button,
  Group,
  Select,
  TextInput,
  Title,
  Divider,
  CloseButton,
  Loader,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  createFileRoute,
  Link,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Upload } from "lucide-react";
import ChevronDownIcon from "@/components/Icons/ChevronDownIcon";
import ExitIcon from "@/components/Icons/ExitIcon";
import SearchIcon from "@/components/Icons/SearchIcon";
import { selectStyles, textInputStyles } from "@/components/Shared/Styles";
// Changed API imports
import { useUpdateBillingList } from "@/api/billingList/update-billing-list";
import { getBillingListById } from "@/api/billingList/get-billing-list-by-id";
import { useState, useEffect, useCallback } from "react";
import { twMerge } from "tailwind-merge";
// Changed component imports
import AddBillingListProductTable from "@/components/AddBillingList/AddBillingListProductTable";
import type { BillingListFilters } from "@/types";
// Define BillingListDetail based on get-billing-list-by-id.ts structure
interface BillingListDetail {
  id: number;
  name: string;
  type: string;
  description: string | null;
  created_at: string;
  products: Array<{
    product_id: number;
    price: number;
    id?: number;
  }>;
}

import {
  getBillingProductList,
  type Product as BillingListApiProduct,
  type Meta as BillingListApiMeta,
  type GetBillingProductListParams,
} from "@/api/billingList/get-billing-product-list";
import Headline from "@/components/Shared/Headline";
// Import APIs for brands and brand pillars
import { getBrands, type Brand as ApiBrand } from "@/api/get-brands"; // Renamed imported Brand to ApiBrand
import {
  getBrandPillars,
  type Pillar as ApiPillar,
} from "@/api/get-brandPillars";
import { useBillingListProductCsvDownload } from "@/lib/hooks/useBillingListProductCsvDownload";

// Changed route and param name
export const Route = createFileRoute("/_auth/settings/edit-billing-list/$id")({
  component: EditBillingListComponent, // Changed component name
});

// Changed interface name
interface BillingListFormValues {
  name: string;
  type: string;
  description: string;
  brand: string; // Keep brand for filtering master data
  brandPillar: string; // Changed from house to brandPillar
  selectedProductsWithPrices: Array<{
    product_id: string; // IRC or ID from MasterProduct
    price: string | number; // The billing value/price for this product
  }>;
}

const PAGE_SIZE = 20;

// Changed component name
function EditBillingListComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const params = useParams({
    from: "/_auth/settings/edit-billing-list/$id", // Changed path
  });
  const billingListId = parseInt(params.id, 10); // Changed param name
  const queryClient = useQueryClient();
  const updateBillingListMutation = useUpdateBillingList(); // Changed hook
  const formId = "edit-billing-list-form"; // Changed form ID
  const [searchTerm, setSearchTerm] = useState("");

  const [productsData, setProductsData] = useState<BillingListApiProduct[]>([]);
  const [selectedTableRow, setSelectedTableRow] = useState<string | null>(null);
  const [productsMeta, setProductsMeta] = useState<BillingListApiMeta | null>(
    null
  );
  const [productsHasMore, setProductsHasMore] = useState(false);
  const [productsIsLoadingMore, setProductsIsLoadingMore] = useState(false);
  const [formInitializedForId, setFormInitializedForId] = useState<
    number | null
  >(null);

  const [brandOptions, setBrandOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [brandPillarOptions, setBrandPillarOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [apiFilters, setApiFilters] = useState<BillingListFilters>({
    search: "",
    brand_id: "",
    brand_pillar_id: "",
  });

  // Derived state for getBillingProductList parameters
  const [billingProductListParams, setBillingProductListParams] =
    useState<GetBillingProductListParams>({});

  const form = useForm<BillingListFormValues>({
    initialValues: {
      name: "",
      type: "",
      description: "",
      brand: "",
      brandPillar: "",
      selectedProductsWithPrices: [],
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : "Name is required"),
      type: (value) => (value ? null : "Type is required"),
    },
  });

  const {
    data: existingBillingListData, // Changed variable name
    isLoading: isLoadingExistingBillingList, // Changed variable name
  } = useQuery<BillingListDetail, Error>({
    queryKey: ["billingList", billingListId], // Changed queryKey
    queryFn: () => getBillingListById(billingListId), // Remove .then(res => res.data)
    enabled: !!billingListId,
  });

  useEffect(() => {
    if (existingBillingListData) {
      if (formInitializedForId !== billingListId) {
        form.setValues({
          name: existingBillingListData.name,
          type: existingBillingListData.type,
          description: existingBillingListData.description || "",
          brand: "",
          brandPillar: "",
          selectedProductsWithPrices:
            existingBillingListData.products?.map((p) => ({
              product_id: p.product_id.toString(), // Use product_id from fetched data
              price: p.price,
            })) || [],
        });
        setFormInitializedForId(billingListId);
      }
    }
  }, [existingBillingListData, form, billingListId, formInitializedForId]);

  useEffect(() => {
    const params: GetBillingProductListParams = {
      billing_list_id: billingListId,
      // cursor will be handled by useQuery and fetchMore
      page_size: PAGE_SIZE,
    };
    if (form.values.brand) {
      params.brand_ids = [Number(form.values.brand)];
    }
    if (form.values.brandPillar) {
      // Assuming brandPillar maps to sub_brand_ids
      params.sub_brand_ids = [Number(form.values.brandPillar)];
    }
    // searchTerm is not directly part of GetBillingProductListParams
    // distributor_id from apiFilters is also not part of GetBillingProductListParams

    setBillingProductListParams(params);

    // Also update the generic apiFilters for other potential consumers like CSV download
    // Note: CSV download might need adjustments if it heavily relied on search/distributor_id from masterData
    setApiFilters({
      search: searchTerm,
      brand_id: form.values.brand || "",
      brand_pillar_id: form.values.brandPillar || "",
    });

    if (!isLoadingExistingBillingList) {
      setProductsData([]);
      setProductsMeta(null);
      setSelectedTableRow(null);
    }
  }, [
    searchTerm,
    form.values.brand,
    form.values.brandPillar,
    isLoadingExistingBillingList,
    billingListId, // Added billingListId
  ]);

  const {
    isLoading: isLoadingInitialProducts,
    error: initialProductsError,
    data: initialBillingProductsResult,
  } = useQuery<Awaited<ReturnType<typeof getBillingProductList>>, Error>({
    queryKey: ["billingListProducts", billingProductListParams],
    queryFn: () => {
      const paramsForApi = { ...billingProductListParams };
      if (billingProductListParams.cursor !== undefined) {
        paramsForApi.cursor = billingProductListParams.cursor;
      }
      return getBillingProductList(paramsForApi);
    },
    enabled:
      !!billingListId && Object.keys(billingProductListParams).length > 0,
  });

  useEffect(() => {
    if (initialBillingProductsResult?.data) {
      // Use initialBillingProductsResult
      setProductsData(initialBillingProductsResult.data); // data is Product[]
      setProductsMeta(initialBillingProductsResult.meta);
      setProductsHasMore(initialBillingProductsResult.meta.has_next);
    } else if (
      !isLoadingInitialProducts &&
      initialBillingProductsResult === undefined
    ) {
      setProductsData([]);
      setProductsMeta(null);
      setProductsHasMore(false);
    }
  }, [initialBillingProductsResult, isLoadingInitialProducts]);

  // Fetch Brands
  const { data: brandsData, isLoading: isLoadingBrands } = useQuery<
    ApiBrand[],
    Error
  >({
    queryKey: ["allBrandsForBillingList"],
    queryFn: async () => {
      const response = await getBrands({ do_not_paginate: 1 });
      return response.data;
    },
  });

  // Effect to update brandOptions when brandsData changes
  useEffect(() => {
    if (brandsData) {
      setBrandOptions(
        brandsData.map((brand: ApiBrand) => ({
          value: brand.id.toString(),
          label: brand.name,
        }))
      );
    } else {
      setBrandOptions([]); // Clear options if data is not available
    }
  }, [brandsData]);

  // Fetch Brand Pillars, dependent on selected brand
  const selectedBrandId = form.values.brand;
  const { data: brandPillarsData, isLoading: isLoadingBrandPillars } = useQuery<
    ApiPillar[],
    Error
  >({
    queryKey: ["brandPillarsForBillingList", selectedBrandId],
    queryFn: async () => {
      if (!selectedBrandId) return [];
      const response = await getBrandPillars({
        filter: { brand_id: selectedBrandId },
      });
      return response.data;
    },
    enabled: !!selectedBrandId,
  });

  // Effect to update brandPillarOptions when brandPillarsData changes
  useEffect(() => {
    if (brandPillarsData) {
      setBrandPillarOptions(
        brandPillarsData.map((pillar: ApiPillar) => ({
          value: pillar.id.toString(),
          label: pillar.name,
        }))
      );
    } else if (!selectedBrandId) {
      setBrandPillarOptions([]);
    }
  }, [brandPillarsData, selectedBrandId]);

  // Clear brand pillar options and field value if brand changes and no new brand is selected
  useEffect(() => {
    if (!selectedBrandId) {
      setBrandPillarOptions([]);
      form.setFieldValue("brandPillar", "");
    }
  }, [selectedBrandId, form]);

  // Re-add billingTypes constant
  const billingTypes = [
    { value: "luxury", label: "Luxury" },
    { value: "consumer beauty", label: "Consumer Beauty" },
  ];

  const handleSubmit = (values: BillingListFormValues) => {
    const { name, type, description, selectedProductsWithPrices } = values;

    // Map form values to the structure expected by updateBillingList API
    const productsPayload = (selectedProductsWithPrices || [])
      .map((p) => ({
        product_id: p.product_id, // Keep as string, matches UpdateBillingListData
        price: Number(p.price), // Ensure price is a number
      }))
      // Ensure product_id is present (it's a string) and price is valid
      .filter((p) => p.product_id && p.price !== undefined && !isNaN(p.price));

    updateBillingListMutation.mutate(
      {
        data: {
          id: billingListId,
          name,
          type,
          description,
          products: productsPayload,
        },
      },
      {
        onSuccess: () => {
          // Invalidate all billing list related queries
          queryClient.invalidateQueries({ queryKey: ["billing-lists"] });
          queryClient.invalidateQueries({ queryKey: ["billingList"] });
          queryClient.invalidateQueries({ queryKey: ["billingProductList"] });
          // Also invalidate the specific billing list being edited
          queryClient.invalidateQueries({
            queryKey: ["billingList", billingListId],
          });
          navigate({
            to: "/settings",
            search: { tab: "billing" },
            replace: true,
          });
        },
        onError: (error) => {
          console.error("Error updating billing list:", error);
        },
      }
    );
  };

  const handleCancel = () => {
    navigate({
      to: "/settings",
      search: { tab: "billing" }, // Changed tab
      replace: true,
    });
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    form.setValues({
      ...form.values,
      brand: "",
      brandPillar: "",
    });
  };

  const fetchMoreEditBillingListProducts = useCallback(async () => {
    if (
      productsIsLoadingMore ||
      !productsMeta?.has_next ||
      productsMeta.cursor === null // Check for null cursor
    )
      return;
    setProductsIsLoadingMore(true);
    try {
      const response = await getBillingProductList({
        // Changed API call
        ...billingProductListParams, // Use current filters
        cursor: productsMeta.cursor, // Use current cursor from meta
        page_size: PAGE_SIZE,
      });
      setProductsData((prev) => [...prev, ...response.data]); // response.data is Product[]
      setProductsMeta(response.meta);
      setProductsHasMore(response.meta.has_next);
    } catch (error) {
      console.error("Error fetching more product data:", error);
    } finally {
      setProductsIsLoadingMore(false);
    }
  }, [productsIsLoadingMore, productsMeta, billingProductListParams]); // Added billingProductListParams

  const isProductListLoading =
    isLoadingInitialProducts || isLoadingExistingBillingList;
  const noProductsFound =
    !isLoadingInitialProducts &&
    !initialProductsError &&
    productsData.length === 0 &&
    !productsHasMore;

  const {
    csvLoading: isDownloadingCsv,
    csvError: downloadError,
    handleBulkDownload: handleDownloadCsv,
  } = useBillingListProductCsvDownload(apiFilters);

  if (isLoadingExistingBillingList) {
    return (
      <div className="w-full text-center p-10">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Headline title="Settings" />
      <div className="w-full py-4 md:py-6">
        <div className="flex justify-between items-center mb-6">
          <Button
            leftSection={
              <div className="transform rotate-90">
                <ChevronDownIcon />
              </div>
            }
            variant="default"
            className="border-none bg-transparent text-primary text-sm font-medium p-0 hover:bg-transparent focus:outline-none focus:ring-0"
            component={Link}
            to="/settings"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            search={{ tab: "billing" } as any} // Changed tab
          >
            Back to Billing list {/* Changed text */}
          </Button>
          <Group gap="sm">
            <Button
              variant="default"
              leftSection={<ExitIcon />}
              className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={formId}
              loading={
                updateBillingListMutation.isPending || isLoadingInitialProducts
              }
              className="border-none w-28 bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
            >
              Save Changes {/* Changed text */}
            </Button>
          </Group>
        </div>

        <form id={formId} onSubmit={form.onSubmit(handleSubmit)}>
          <section className="mb-8">
            <div className="bg-white shadow-md rounded-lg p-6">
              <Title
                order={2}
                className="text-primary font-semibold text-xl mb-6"
              >
                Edit billing list {/* Changed text */}
              </Title>
              <Group grow align="start" gap="xl">
                <TextInput
                  {...form.getInputProps("name")}
                  label="Billing list name" // Changed text
                  placeholder="Name example"
                  classNames={textInputStyles}
                  required
                />
                <Select
                  {...form.getInputProps("type")}
                  label="Brand type" // Or "Billing list type"
                  placeholder="Select type"
                  data={billingTypes} // Changed data
                  rightSection={<ChevronDownIcon />}
                  classNames={selectStyles}
                  clearable
                  searchable
                  required
                />
              </Group>
              <Textarea
                {...form.getInputProps("description")}
                label="Description"
                placeholder="Enter billing list description (optional)" // Changed text
                classNames={{
                  input:
                    "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm",
                  label: "block text-sm font-medium text-gray-700 mt-4",
                }}
                autosize
                minRows={2}
              />
            </div>
          </section>

          <section className="mb-8">
            <div className="bg-white shadow-md rounded-lg p-6">
              <Group justify="space-between" align="center">
                <Title order={2} className="text-primary font-semibold text-xl">
                  Refine your results
                </Title>
                <Button
                  rightSection={<ExitIcon />}
                  onClick={handleClearAllFilters}
                  variant="outline"
                  className="border-primary border-s-e rounded-ee-xl text-primary text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
                >
                  Clear all
                </Button>
              </Group>

              <div className="flex items-center gap-x-5 mt-6">
                <TextInput
                  placeholder="Search for..."
                  leftSection={<SearchIcon />}
                  className="flex-grow"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.currentTarget.value)}
                  classNames={textInputStyles}
                />
                <button
                  type="button"
                  className={twMerge(
                    "flex items-center gap-x-2 cursor-pointer group",
                    !searchTerm.length && "invisible"
                  )}
                  onClick={() => setSearchTerm("")}
                >
                  <CloseButton className="group-hover:text-[#00EBB2] transition-all ease-in-out duration-300" />
                  <span className="hidden sm:inline text-nowrap text-primary font-medium group-hover:text-[#00EBB2] transition-all ease-in-out duration-300">
                    Clear
                  </span>
                </button>
              </div>

              <Divider className="my-4 sm:my-6 border-primary border-opacity-50" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <Select
                  {...form.getInputProps("brand")}
                  label="Filter brand"
                  placeholder="Filter brand"
                  data={brandOptions}
                  rightSection={<ChevronDownIcon />}
                  classNames={selectStyles}
                  searchable
                  clearable
                  disabled={isLoadingBrands}
                />
                <Select
                  {...form.getInputProps("brandPillar")}
                  label="Filter brand pillar"
                  placeholder={
                    isLoadingBrandPillars
                      ? "Loading pillars..."
                      : "Filter brand pillar"
                  }
                  data={brandPillarOptions}
                  rightSection={<ChevronDownIcon />}
                  classNames={selectStyles}
                  searchable
                  clearable
                  disabled={isLoadingBrandPillars || !selectedBrandId}
                />
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex justify-end items-center mb-6">
                <Group gap="sm">
                  <Button
                    variant="outline"
                    leftSection={<Download size={16} />}
                    className="text-primary border-primary hover:bg-primary/5"
                    onClick={handleDownloadCsv}
                    loading={isDownloadingCsv}
                    disabled={isDownloadingCsv || productsData.length === 0}
                  >
                    Download list
                  </Button>
                  <Button
                    variant="outline"
                    leftSection={<Upload size={16} />}
                    className="text-primary border-primary hover:bg-primary/5"
                  >
                    Upload list
                  </Button>
                </Group>
              </div>

              {downloadError && (
                <div className="text-center py-2 text-red-500 mb-4">
                  <p>Error downloading products: {downloadError.message}</p>
                </div>
              )}

              {initialProductsError ? (
                <div className="text-center py-10 text-red-500">
                  <p>Error loading products: {initialProductsError.message}</p>
                </div>
              ) : isProductListLoading && productsData.length === 0 ? (
                <div className="text-center py-10">
                  <Loader />
                </div>
              ) : noProductsFound ? (
                <div className="text-center py-10 text-gray-500">
                  <p>
                    No products found. Try adjusting filters or search term.
                  </p>
                  <p className="text-sm mt-1">
                    Alternatively, upload a product list.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-4">
                  <div className="lg:col-span-5 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                    <AddBillingListProductTable
                      products={productsData}
                      selectedRow={selectedTableRow}
                      setSelectedRow={setSelectedTableRow}
                      fetchMoreData={fetchMoreEditBillingListProducts}
                      hasMore={productsHasMore}
                      isLoadingMore={productsIsLoadingMore}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        </form>
      </div>
    </>
  );
}
