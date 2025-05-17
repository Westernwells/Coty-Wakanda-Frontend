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
  MultiSelect,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  createFileRoute,
  Link,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download } from "lucide-react";
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
// import type { BillingListFilters } from "@/types"; // Removed as it's unused

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
  // getBillingProductList, // This will be removed
  type Product as BillingListApiProduct,
  type Meta as BillingListApiMeta,
  type GetBillingProductListResponse, // Keep this for typing queryFn fallback
  // type GetBillingProductListParams, // This will be removed
} from "@/api/billingList/get-billing-product-list";
import { getBillingListByBillingId } from "@/api/billingList/get-billing-list";
import Headline from "@/components/Shared/Headline";
// Import APIs for brands and brand pillars
import { getBrands, type Brand as ApiBrand } from "@/api/get-brands"; // Renamed imported Brand to ApiBrand
import { useBillingListProductCsvDownload } from "@/lib/hooks/useBillingListProductCsvDownload";
import { CsvUpload } from "@/components/AddPricingList/CsvUpload";

// Changed route and param name
export const Route = createFileRoute("/_auth/settings/edit-billing-list/$id")({
  component: EditBillingListComponent, // Changed component name
});

// Changed interface name
interface BillingListFormValues {
  name: string;
  type: string;
  description: string;
  brand: string[];
  selectedProductsWithPrices: Array<{
    product_id: string;
    price: string | number;
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

  const form = useForm<BillingListFormValues>({
    initialValues: {
      name: "",
      type: "",
      description: "",
      brand: [],
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

  console.log({ existingBillingListData });

  useEffect(() => {
    if (existingBillingListData) {
      if (formInitializedForId !== billingListId) {
        form.setValues({
          name: existingBillingListData.name,
          type: existingBillingListData.type,
          description: existingBillingListData.description || "",
          brand: [],
          selectedProductsWithPrices:
            existingBillingListData.products
              ?.filter((p) => p && typeof p.product_id === "number")
              .map((p) => ({
                product_id: p.product_id.toString(),
                price: p.price,
              })) || [],
        });
        setFormInitializedForId(billingListId);
      }
    }
  }, [
    existingBillingListData,
    billingListId,
    formInitializedForId,
    form.setValues,
  ]);

  const {
    isLoading: isLoadingInitialProducts,
    error: initialProductsError,
    data: initialBillingProductsResult,
  } = useQuery<Awaited<ReturnType<typeof getBillingListByBillingId>>, Error>({
    queryKey: [
      "billingListProductsById",
      billingListId,
      form.values.type,
      form.values.brand,
    ],
    queryFn: () => {
      if (!form.values.type || !billingListId) {
        return Promise.resolve({
          message: "Required parameters missing",
          data: [],
          meta: {
            cursor: null,
            page_size: PAGE_SIZE,
            has_previous: false,
            has_next: false,
            total: 0,
          },
        } as GetBillingProductListResponse);
      }
      return getBillingListByBillingId({
        billingId: billingListId.toString(),
        brandType: form.values.type,
        brandIds:
          form.values.brand.length > 0
            ? form.values.brand.map(Number)
            : undefined,
        cursor: 1,
        pageSize: PAGE_SIZE,
      });
    },
    enabled: !!billingListId && !!form.values.type,
  });

  useEffect(() => {
    if (initialBillingProductsResult) {
      const data = initialBillingProductsResult.data || [];
      // Provide a default for meta if it's undefined or null in the response
      const metaOrDefault = initialBillingProductsResult.meta || {
        cursor: null,
        page_size: PAGE_SIZE,
        has_previous: false,
        has_next: false,
        total: data.length, // Default total based on current data if meta is missing
      };

      setProductsData(data);
      setProductsMeta(metaOrDefault as BillingListApiMeta); // Assert type as Meta because we're providing a full default
      setProductsHasMore(metaOrDefault.has_next);
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

  // Re-add billingTypes constant
  const billingTypes = [
    { value: "luxury", label: "Luxury" },
    { value: "consumer beauty", label: "Consumer Beauty" },
  ];

  const handleSubmit = (values: BillingListFormValues) => {
    const { name, type, description } = values;

    const productsPayload = (initialBillingProductsResult?.data || []).map(
      (p) => {
        let priceValue = 0; // Default price to 0
        if (p.price !== null && p.price !== undefined) {
          const numPrice = Number(p.price);
          // Ensure that if p.price was a string, it converted to a valid number
          if (!isNaN(numPrice)) {
            priceValue = numPrice;
          }
        }
        return {
          product_id: p.id.toString(), // p.id is already number, Number() is for safety.
          price: priceValue,
        };
      }
    );
    console.log({ productsPayload });

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
          queryClient.invalidateQueries({ queryKey: ["billing-lists"] });
          queryClient.invalidateQueries({
            queryKey: ["billingList", billingListId],
          });
          queryClient.invalidateQueries({
            queryKey: ["billingListProductsById", billingListId],
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
      search: { tab: "billing" },
      replace: true,
    });
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    form.setValues({
      ...form.values,
      brand: [],
    });
  };

  const handleCsvUpload = useCallback(
    (
      data: Array<{
        brand_name: string;
        description: string;
        brand_pillar: string;
        article_type: string;
        price: number;
        irc: string;
      }>
    ) => {
      updateBillingListMutation.mutate(
        {
          data: {
            id: billingListId,
            name: form.values.name,
            type: form.values.type,
            description: form.values.description,
            file: data,
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["billing-lists"] });
            queryClient.invalidateQueries({
              queryKey: ["billingList", billingListId],
            });
            queryClient.invalidateQueries({
              queryKey: ["billingListProductsById", billingListId],
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
    },
    [
      form.values,
      billingListId,
      updateBillingListMutation,
      queryClient,
      navigate,
    ]
  );

  const fetchMoreEditBillingListProducts = useCallback(async () => {
    if (
      productsIsLoadingMore ||
      !productsMeta ||
      !productsMeta.has_next ||
      productsMeta.cursor === null ||
      !form.values.type ||
      !billingListId
    )
      return;

    setProductsIsLoadingMore(true);
    try {
      const apiResponse = await getBillingListByBillingId({
        billingId: billingListId.toString(),
        brandType: form.values.type,
        brandIds:
          form.values.brand.length > 0
            ? form.values.brand.map(Number)
            : undefined,
        cursor: productsMeta.cursor,
        pageSize: PAGE_SIZE,
      });

      if (apiResponse && apiResponse.meta) {
        setProductsData((prev) => [...prev, ...(apiResponse.data || [])]);
        setProductsMeta(apiResponse.meta);
        setProductsHasMore(apiResponse.meta.has_next);
      } else {
        console.warn(
          "fetchMoreEditBillingListProducts: API response was missing or did not contain meta property.",
          apiResponse
        );
        setProductsHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching more product data:", error);
      setProductsHasMore(false);
    } finally {
      setProductsIsLoadingMore(false);
    }
  }, [
    productsIsLoadingMore,
    productsMeta,
    billingListId,
    form.values.type,
    form.values.brand,
  ]);

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
  } = useBillingListProductCsvDownload({
    mode: "edit",
    billingId: billingListId.toString(),
    brandType: form.values.type,
    filters: {
      brand_id:
        form.values.brand.length > 0 ? form.values.brand.join(",") : undefined,
    },
  });

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
                <MultiSelect
                  {...form.getInputProps("brand")}
                  label="Filter brand"
                  placeholder="Filter brand(s)"
                  data={brandOptions}
                  classNames={selectStyles}
                  searchable
                  clearable
                  disabled={isLoadingBrands}
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
                  <CsvUpload onUpload={handleCsvUpload} />
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
