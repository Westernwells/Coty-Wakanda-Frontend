import {
  Button,
  Group,
  MultiSelect,
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
import { Download } from "lucide-react";
import ChevronDownIcon from "@/components/Icons/ChevronDownIcon";
import ExitIcon from "@/components/Icons/ExitIcon";
import SearchIcon from "@/components/Icons/SearchIcon";
import { selectStyles, textInputStyles } from "@/components/Shared/Styles";
import { useUpdatePricingList } from "@/api/pricingList/update-pricing-list";
import { getPricingListById } from "@/api/pricingList/get-pricing-list-by-id";
import { useState, useEffect, useCallback } from "react";
import { twMerge } from "tailwind-merge";
import AddPricingListProductTable from "@/components/AddPricingList/AddPricingListProductTable";
import type { Product, Meta } from "@/api/pricingList/get-pricing-product-list";
import { getPricingListByPricingId } from "@/api/pricingList/get-pricing-list";
import type { PricingList } from "@/types";
import Headline from "@/components/Shared/Headline";
import { getBrands, type Brand as ApiBrand } from "@/api/get-brands";
import { usePricingListProductCsvDownload } from "@/lib/hooks/usePricingListProductCsvDownload";
import { CsvUpload } from "@/components/AddPricingList/CsvUpload";

export const Route = createFileRoute(
  "/_auth/settings/edit-pricing-list/$pricingListId"
)({
  component: EditPricingListComponent,
});

interface PricingListFormValues {
  name: string;
  type: string;
  description: string;
  brands: string[];
  selectedProductsWithPrices: Array<{
    product_id: string;
    price: string | number;
  }>;
}

const PAGE_SIZE = 20;

function EditPricingListComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const params = useParams({
    from: "/_auth/settings/edit-pricing-list/$pricingListId",
  });
  const pricingListId = parseInt(params.pricingListId, 10);
  const queryClient = useQueryClient();
  const updatePricingListMutation = useUpdatePricingList();
  const formId = "edit-pricing-list-form";
  const [searchTerm, setSearchTerm] = useState("");
  const [isCsvMode, setIsCsvMode] = useState(false);

  const [productsData, setProductsData] = useState<Product[]>([]);
  const [selectedTableRow, setSelectedTableRow] = useState<string | null>(null);
  const [productsMeta, setProductsMeta] = useState<Meta | null>(null);
  const [productsHasMore, setProductsHasMore] = useState(false);
  const [productsIsLoadingMore, setProductsIsLoadingMore] = useState(false);

  const [brandOptions, setBrandOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const form = useForm<PricingListFormValues>({
    initialValues: {
      name: "",
      type: "",
      description: "",
      brands: [],
      selectedProductsWithPrices: [],
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : "Name is required"),
      type: (value) => (value ? null : "Type is required"),
    },
  });

  const {
    data: existingPricingListData,
    isLoading: isLoadingExistingPricingList,
  } = useQuery<PricingList, Error>({
    queryKey: ["pricingList", pricingListId],
    queryFn: () => getPricingListById(pricingListId),
    enabled: !!pricingListId,
  });

  const {
    isLoading: isLoadingInitialProducts,
    error: initialProductsError,
    data: initialPricingProductListResult,
  } = useQuery<Awaited<ReturnType<typeof getPricingListByPricingId>>, Error>({
    queryKey: [
      "pricingListProducts",
      pricingListId,
      form.values.type,
      form.values.brands,
    ],
    queryFn: () =>
      getPricingListByPricingId({
        pricingId: pricingListId.toString(),
        brandType: form.values.type,
        cursor: 1,
        pageSize: PAGE_SIZE,
        brandIds: form.values.brands?.map(Number),
      }),
    enabled: !isCsvMode && !!pricingListId && !!form.values.type,
  });

  useEffect(() => {
    if (!isCsvMode && initialPricingProductListResult?.data) {
      setProductsData(initialPricingProductListResult.data);
      setProductsMeta(initialPricingProductListResult.meta);
      setProductsHasMore(initialPricingProductListResult.meta.has_next);
    } else if (
      !isCsvMode &&
      !isLoadingInitialProducts &&
      initialPricingProductListResult === undefined
    ) {
      setProductsData([]);
      setProductsMeta(null);
      setProductsHasMore(false);
    }
  }, [isCsvMode, initialPricingProductListResult, isLoadingInitialProducts]);

  const { data: brandsData, isLoading: isLoadingBrands } = useQuery<
    ApiBrand[],
    Error
  >({
    queryKey: ["allBrandsForEditPricingList"],
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

  useEffect(() => {
    if (existingPricingListData) {
      form.setValues((currentValues) => ({
        ...currentValues,
        name: existingPricingListData.name,
        type: existingPricingListData.type,
        description: existingPricingListData.description || "",
        brands: currentValues.brands,
        selectedProductsWithPrices:
          existingPricingListData.products?.map((p) => ({
            product_id: String(p.id),
            price: p.price,
          })) || [],
      }));
    }
  }, [existingPricingListData, form.setValues]);

  const pricingTypes = [
    { value: "luxury", label: "Luxury" },
    { value: "consumer beauty", label: "Consumer Beauty" },
  ];

  const handleSubmit = (values: PricingListFormValues) => {
    const { name, type, description } = values;

    updatePricingListMutation.mutate(
      {
        data: {
          id: pricingListId,
          name,
          type,
          description,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["pricing-lists"] });
          queryClient.invalidateQueries({
            queryKey: ["pricingList", pricingListId],
          });
          navigate({
            to: "/settings",
            search: { tab: "pricing" },
            replace: true,
          });
        },
        onError: (error) => {
          console.error("Error updating pricing list:", error);
        },
      }
    );
  };

  const handleCancel = () => {
    navigate({
      to: "/settings",
      search: { tab: "pricing" },
      replace: true,
    });
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    form.setValues({
      ...form.values,
      brands: [],
    });

    if (isCsvMode) {
      setIsCsvMode(false);
      setProductsData([]);
      setProductsMeta(null);
      queryClient.invalidateQueries({
        queryKey: ["pricingListProducts", pricingListId, form.values.type],
      });
    }
  };

  const fetchMoreAddPricingListProducts = useCallback(async () => {
    if (
      isCsvMode ||
      productsIsLoadingMore ||
      !productsMeta?.has_next ||
      productsMeta.cursor === null ||
      form.values.brands?.length // Don't fetch more if using brand filter
    )
      return;

    setProductsIsLoadingMore(true);
    try {
      const response = await getPricingListByPricingId({
        pricingId: pricingListId.toString(),
        brandType: form.values.type,
        cursor: productsMeta.cursor,
        pageSize: PAGE_SIZE,
        brandIds: form.values.brands?.map(Number),
      });
      setProductsData((prev) => [...prev, ...response.data]);
      setProductsMeta(response.meta);
      setProductsHasMore(response.meta.has_next);
    } catch (error) {
      console.error("Error fetching more product data:", error);
    } finally {
      setProductsIsLoadingMore(false);
    }
  }, [
    isCsvMode,
    productsIsLoadingMore,
    productsMeta,
    pricingListId,
    form.values.type,
    form.values.brands,
  ]);

  const {
    csvLoading: isDownloadingCsv,
    handleBulkDownload: handleDownloadCsv,
  } = usePricingListProductCsvDownload({
    brand_id: form.values.brands.join(","),
  });

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
      updatePricingListMutation.mutate(
        {
          data: {
            id: pricingListId,
            name: form.values.name,
            type: form.values.type,
            description: form.values.description,
            file: data,
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pricing-lists"] });
            queryClient.invalidateQueries({
              queryKey: ["pricingList", pricingListId],
            });
            navigate({
              to: "/settings",
              search: { tab: "pricing" },
              replace: true,
            });
          },
          onError: (error) => {
            console.error("Error updating pricing list:", error);
          },
        }
      );

      setIsCsvMode(true);
    },
    [
      form.values,
      pricingListId,
      updatePricingListMutation,
      queryClient,
      navigate,
    ]
  );

  const isProductListLoading = !isCsvMode && isLoadingInitialProducts;
  const noProductsFound =
    !isCsvMode &&
    !isLoadingInitialProducts &&
    !initialProductsError &&
    productsData.length === 0 &&
    !productsHasMore;

  const noCsvProductsFound = isCsvMode && productsData.length === 0;

  if (isLoadingExistingPricingList) {
    return (
      <div className="w-full py-4 md:py-6 flex justify-center items-center">
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
            search={{ tab: "pricing" } as any}
          >
            Back to Pricing list
          </Button>
          <Group gap="sm">
            <Button
              variant="default"
              leftSection={<ExitIcon />}
              className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={formId}
              loading={
                updatePricingListMutation.isPending ||
                (!isCsvMode && isLoadingInitialProducts) ||
                isLoadingExistingPricingList
              }
              className="border-none w-fit bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
            >
              Save Changes
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
                Edit pricing list
              </Title>
              <Group grow align="start" gap="xl">
                <TextInput
                  {...form.getInputProps("name")}
                  label="Pricing list name"
                  placeholder="Name example"
                  classNames={textInputStyles}
                  required
                />
                <Select
                  {...form.getInputProps("type")}
                  label="Brand type"
                  placeholder="Select type"
                  data={pricingTypes}
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
                placeholder="Enter pricing list description (optional)"
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
                  disabled={isCsvMode}
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
                  label="Filter by Brands"
                  placeholder="Select Brands"
                  data={brandOptions}
                  rightSection={<ChevronDownIcon />}
                  classNames={selectStyles}
                  searchable
                  clearable
                  value={form.values.brands}
                  onChange={(value) => form.setFieldValue("brands", value)}
                  disabled={isLoadingBrands || isCsvMode}
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
                    No products found. Try adjusting brand filter or search
                    term.
                  </p>
                  <p className="text-sm mt-1">
                    Alternatively, upload a product list.
                  </p>
                </div>
              ) : noCsvProductsFound ? (
                <div className="text-center py-10 text-gray-500">
                  <p>
                    No products found in the uploaded CSV, or the file might be
                    empty/invalid.
                  </p>
                  <p className="text-sm mt-1">
                    Please check the CSV format and content, then try uploading
                    again.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-4">
                  <div className="lg:col-span-5 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                    <AddPricingListProductTable
                      products={productsData}
                      selectedRow={selectedTableRow}
                      setSelectedRow={setSelectedTableRow}
                      fetchMoreData={fetchMoreAddPricingListProducts}
                      hasMore={isCsvMode ? false : productsHasMore}
                      isLoadingMore={isCsvMode ? false : productsIsLoadingMore}
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
