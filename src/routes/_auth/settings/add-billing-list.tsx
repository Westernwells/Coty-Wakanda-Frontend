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
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download } from "lucide-react";
import ChevronDownIcon from "@/components/Icons/ChevronDownIcon";
import ExitIcon from "@/components/Icons/ExitIcon";
import SearchIcon from "@/components/Icons/SearchIcon";
import { selectStyles, textInputStyles } from "@/components/Shared/Styles";
import { useAddBillingList } from "@/api/billingList/add-billing-list";
import { useState, useEffect, useCallback } from "react";
import { twMerge } from "tailwind-merge";
import AddBillingListProductTable from "@/components/AddBillingList/AddBillingListProductTable";
import type {
  Product,
  Meta,
  GetBillingProductListResponse,
} from "@/api/billingList/get-billing-product-list";
import Headline from "@/components/Shared/Headline";
import { getBrands, type Brand as ApiBrand } from "@/api/get-brands";
import {
  getBrandPillars,
  type Pillar as ApiPillar,
} from "@/api/get-brandPillars";
import { getBillingListByBrandType } from "@/api/billingList/get-billing-list";
import { useBillingListProductCsvDownload } from "@/lib/hooks/useBillingListProductCsvDownload";
import { CsvUpload } from "@/components/AddPricingList/CsvUpload";

export const Route = createFileRoute("/_auth/settings/add-billing-list")({
  component: AddBillingListComponent,
});

interface BillingListFormValues {
  name: string;
  type: string;
  description: string;
  brand: string;
  brandPillar: string;
  selectedProductsWithPrices: Array<{
    product_id: string;
    price: string | number;
  }>;
}

const PAGE_SIZE = 20;

function AddBillingListComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const queryClient = useQueryClient();
  const addBillingListMutation = useAddBillingList();
  const formId = "add-billing-list-form";
  const [searchTerm, setSearchTerm] = useState("");

  const [productsData, setProductsData] = useState<Product[]>([]);
  const [selectedTableRow, setSelectedTableRow] = useState<string | null>(null);
  const [productsMeta, setProductsMeta] = useState<Meta | null>(null);
  const [productsHasMore, setProductsHasMore] = useState(false);
  const [productsIsLoadingMore, setProductsIsLoadingMore] = useState(false);

  const [brandOptions, setBrandOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [brandPillarOptions, setBrandPillarOptions] = useState<
    { value: string; label: string }[]
  >([]);

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
    csvLoading: isDownloadingCsv,
    csvError: downloadError,
    handleBulkDownload: handleDownloadCsv,
  } = useBillingListProductCsvDownload({
    mode: "add",
    brandType: form.values.type,
    filters: {
      brand_id: form.values.brand,
      brand_pillar_id: form.values.brandPillar,
    },
  });

  useEffect(() => {
    setProductsData([]);
    setProductsMeta(null);
    setSelectedTableRow(null);
  }, [
    searchTerm,
    form.values.brand,
    form.values.brandPillar,
    form.values.type,
  ]);

  const {
    isLoading: isLoadingInitialProducts,
    error: initialProductsError,
    data: initialBillingProductListResult,
  } = useQuery<Awaited<ReturnType<typeof getBillingListByBrandType>>, Error>({
    queryKey: [
      "billingProductsByBrandType",
      form.values.type,
      form.values.brand,
      form.values.brandPillar,
      searchTerm,
    ],
    queryFn: () => {
      if (!form.values.type) {
        return Promise.resolve({
          message: "Brand type not selected",
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
      return getBillingListByBrandType({
        brandType: form.values.type,
        brandIds: form.values.brand ? [Number(form.values.brand)] : undefined,
        cursor: 1,
        pageSize: PAGE_SIZE,
      });
    },
    enabled: !!form.values.type,
  });

  console.log(initialBillingProductListResult);

  useEffect(() => {
    if (initialBillingProductListResult?.data) {
      setProductsData(initialBillingProductListResult.data);
      setProductsMeta(initialBillingProductListResult.meta);
      setProductsHasMore(initialBillingProductListResult.meta.has_next);
    } else if (
      !isLoadingInitialProducts &&
      initialBillingProductListResult === undefined
    ) {
      setProductsData([]);
      setProductsMeta(null);
      setProductsHasMore(false);
    }
  }, [initialBillingProductListResult, isLoadingInitialProducts]);

  const { data: brandsData, isLoading: isLoadingBrands } = useQuery<
    ApiBrand[],
    Error
  >({
    queryKey: ["allBrandsForAddBillingList"],
    queryFn: async () => {
      const response = await getBrands({ do_not_paginate: 1 });
      return response.data;
    },
  });

  useEffect(() => {
    if (brandsData) {
      setBrandOptions(
        brandsData.map((brand: ApiBrand) => ({
          value: brand.id.toString(),
          label: brand.name,
        }))
      );
    } else {
      setBrandOptions([]);
    }
  }, [brandsData]);

  const selectedBrandIdFromForm = form.values.brand;
  const { data: brandPillarsData, isLoading: isLoadingBrandPillars } = useQuery<
    ApiPillar[],
    Error
  >({
    queryKey: ["brandPillarsForAddBillingList", selectedBrandIdFromForm],
    queryFn: async () => {
      if (!selectedBrandIdFromForm) return [];
      const response = await getBrandPillars({
        filter: { brand_id: selectedBrandIdFromForm },
      });
      return response.data;
    },
    enabled: !!selectedBrandIdFromForm,
  });

  console.log({ brandPillarsData });

  useEffect(() => {
    if (brandPillarsData) {
      setBrandPillarOptions(
        brandPillarsData.map((pillar: ApiPillar) => ({
          value: pillar.id.toString(),
          label: pillar.name,
        }))
      );
    } else if (!selectedBrandIdFromForm) {
      setBrandPillarOptions([]);
    }
  }, [brandPillarsData, selectedBrandIdFromForm]);

  const billingTypes = [
    { value: "luxury", label: "Luxury" },
    { value: "consumer beauty", label: "Consumer Beauty" },
  ];

  const handleSubmit = (values: BillingListFormValues) => {
    const { name, type, description, selectedProductsWithPrices } = values;

    const productsPayload = (selectedProductsWithPrices || [])
      .map((p) => ({
        product_id: Number(p.product_id),
        price: Number(p.price),
      }))
      .filter(
        (p) =>
          p.product_id &&
          !isNaN(p.product_id) &&
          p.price !== undefined &&
          !isNaN(p.price)
      );

    console.log(
      "Form submitted for Billing List. Name:",
      name,
      "Type:",
      type,
      "Description:",
      description,
      "Products:",
      productsPayload
    );

    addBillingListMutation.mutate(
      {
        data: {
          name,
          type,
          description,
          products: productsPayload,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["billing-lists"] });
          queryClient.invalidateQueries({ queryKey: ["billingList"] });
          navigate({
            to: "/settings",
            search: { tab: "billing" },
            replace: true,
          });
        },
        onError: (error) => {
          console.error("Error adding billing list:", error);
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
      brand: "",
      brandPillar: "",
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
      addBillingListMutation.mutate(
        {
          data: {
            name: form.values.name,
            type: form.values.type,
            description: form.values.description,
            file: data,
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["billing-lists"] });
            queryClient.invalidateQueries({ queryKey: ["billingList"] });
            navigate({
              to: "/settings",
              search: { tab: "billing" },
              replace: true,
            });
          },
          onError: (error) => {
            console.error("Error adding billing list:", error);
          },
        }
      );
    },
    [form.values, addBillingListMutation, queryClient, navigate]
  );

  const fetchMoreAddBillingListProducts = useCallback(async () => {
    if (
      productsIsLoadingMore ||
      !productsMeta?.has_next ||
      productsMeta.cursor === null ||
      !form.values.type
    )
      return;

    setProductsIsLoadingMore(true);
    try {
      const response = await getBillingListByBrandType({
        brandType: form.values.type,
        brandIds: form.values.brand ? [Number(form.values.brand)] : undefined,
        cursor: productsMeta.cursor,
        pageSize: PAGE_SIZE,
      });
      setProductsData((prevData) => [...prevData, ...response.data]);
      setProductsMeta(response.meta);
      setProductsHasMore(response.meta.has_next);
    } catch (error) {
      console.error("Error fetching more product data:", error);
    } finally {
      setProductsIsLoadingMore(false);
    }
  }, [
    productsIsLoadingMore,
    productsMeta,
    form.values.type,
    form.values.brand,
  ]);

  const isProductListLoading = isLoadingInitialProducts;
  const noProductsFound =
    !isLoadingInitialProducts &&
    !initialProductsError &&
    productsData.length === 0 &&
    !productsHasMore;

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
            search={{ tab: "billing" } as any}
          >
            Back to Billing list
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
                addBillingListMutation.isPending || isLoadingInitialProducts
              }
              className="border-none w-28 bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
            >
              Save
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
                Add billing list
              </Title>
              <Group grow align="start" gap="xl">
                <TextInput
                  {...form.getInputProps("name")}
                  label="Billing list name"
                  placeholder="Name example"
                  classNames={textInputStyles}
                  required
                />
                <Select
                  {...form.getInputProps("type")}
                  label="Brand type"
                  placeholder="Select type"
                  data={billingTypes}
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
                placeholder="Enter billing list description (optional)"
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
                  label="Filter by Brand"
                  placeholder="Select Brand"
                  data={brandOptions}
                  rightSection={<ChevronDownIcon />}
                  classNames={selectStyles}
                  searchable
                  clearable
                  disabled={isLoadingBrands}
                />
                <Select
                  {...form.getInputProps("brandPillar")}
                  label="Filter by Brand Pillar"
                  placeholder="Select Brand Pillar"
                  data={brandPillarOptions}
                  rightSection={<ChevronDownIcon />}
                  classNames={selectStyles}
                  searchable
                  clearable
                  disabled={isLoadingBrandPillars || !selectedBrandIdFromForm}
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
              ) : isProductListLoading ? (
                <div className="text-center py-10">
                  <Loader />
                </div>
              ) : noProductsFound ? (
                <div className="text-center py-10 text-gray-500">
                  <p>
                    No products found. Try adjusting brand filter or search term
                    (search is client-side).
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
                      fetchMoreData={fetchMoreAddBillingListProducts}
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
