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
import { useUpdatePricingList } from "@/api/pricingList/update-pricing-list";
import { getPricingListById } from "@/api/pricingList/get-pricing-list-by-id";
import { useState, useEffect, useCallback } from "react";
import { twMerge } from "tailwind-merge";
import AddPricingListProductTable from "@/components/AddPricingList/AddPricingListProductTable";
import type { Product, Meta } from "@/api/pricingList/get-pricing-product-list";
import { getPricingProductList } from "@/api/pricingList/get-pricing-product-list";
import type { PricingList, PricingListFilters } from "@/types";
import Headline from "@/components/Shared/Headline";
import { usePricingListProductCsvDownload } from "@/lib/hooks/usePricingListProductCsvDownload";

export const Route = createFileRoute(
  "/_auth/settings/edit-pricing-list/$pricingListId"
)({
  component: EditPricingListComponent,
});

interface PricingListFormValues {
  name: string;
  type: string;
  description: string;
  house: string;
  brand: string;
  brandPillar: string;
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

  const [productsData, setProductsData] = useState<Product[]>([]);

  const [selectedTableRow, setSelectedTableRow] = useState<string | null>(null);
  const [productsMeta, setProductsMeta] = useState<Meta | null>(null);
  const [productsHasMore, setProductsHasMore] = useState(false);
  const [productsIsLoadingMore, setProductsIsLoadingMore] = useState(false);
  const [formInitializedForId, setFormInitializedForId] = useState<
    number | null
  >(null);

  const [houseOptions, setHouseOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [brandOptions, setBrandOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [apiFilters, setApiFilters] = useState<PricingListFilters>({
    search: "",
    brand_id: "",
    brand_pillar_id: "",
  });

  const {
    csvLoading: isDownloadingCsv,
    handleBulkDownload: handleDownloadCsv,
  } = usePricingListProductCsvDownload(apiFilters);

  const form = useForm<PricingListFormValues>({
    initialValues: {
      name: "",
      type: "",
      description: "",
      house: "",
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
    data: existingPricingListData,
    isLoading: isLoadingExistingPricingList,
  } = useQuery<PricingList, Error>({
    queryKey: ["pricingList", pricingListId],
    queryFn: () => getPricingListById(pricingListId),
    enabled: !!pricingListId,
  });

  useEffect(() => {
    if (existingPricingListData) {
      if (formInitializedForId !== pricingListId) {
        form.setValues({
          name: existingPricingListData.name,
          type: existingPricingListData.type,
          description: existingPricingListData.description || "",
          house: "",
          brand: "",
          brandPillar: "",
          selectedProductsWithPrices:
            existingPricingListData.products?.map((p) => ({
              product_id: String(p.id),
              price: p.price,
            })) || [],
        });
        setFormInitializedForId(pricingListId);
      }
    }
  }, [existingPricingListData, form, pricingListId, formInitializedForId]);

  useEffect(() => {
    setApiFilters({
      search: searchTerm,
      brand_id: form.values.brand || "",
      brand_pillar_id: form.values.brandPillar || "",
    });
    if (!isLoadingExistingPricingList) {
      setProductsData([]);
      setProductsMeta(null);
      setSelectedTableRow(null);
    }
  }, [
    searchTerm,
    form.values.brand,
    form.values.brandPillar,
    isLoadingExistingPricingList,
  ]);

  const {
    isLoading: isLoadingInitialProducts,
    error: initialProductsError,
    data: initialProductsData,
  } = useQuery<Awaited<ReturnType<typeof getPricingProductList>>, Error>({
    queryKey: [
      "pricingProductList",
      form.values.brand,
      form.values.brandPillar,
      searchTerm,
    ],
    queryFn: () =>
      getPricingProductList({
        cursor: 1,
        page_size: PAGE_SIZE,
        brand_ids: form.values.brand ? [Number(form.values.brand)] : undefined,
        sub_brand_ids: form.values.brandPillar
          ? [Number(form.values.brandPillar)]
          : undefined,
      }),
    enabled: true,
  });

  useEffect(() => {
    if (initialProductsData?.data) {
      setProductsData(initialProductsData.data);
      setProductsMeta(initialProductsData.meta);
      setProductsHasMore(initialProductsData.meta.has_next);
    } else if (!isLoadingInitialProducts && initialProductsData === undefined) {
      setProductsData([]);
      setProductsMeta(null);
      setProductsHasMore(false);
    }
  }, [initialProductsData, isLoadingInitialProducts]);

  useEffect(() => {
    if (productsData && productsData.length > 0) {
      const uniqueBrands = Array.from(
        new Set(productsData.map((p) => p.brand?.name).filter(Boolean))
      );
      setBrandOptions(
        uniqueBrands.map((brand) => ({ value: brand, label: brand }))
      );
    } else {
      setHouseOptions([]);
      setBrandOptions([]);
    }
  }, [productsData]);

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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            search: { tab: "pricing" } as any,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigate({
      to: "/settings",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      search: { tab: "pricing" } as any,
      replace: true,
    });
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    form.setValues({
      ...form.values,
      house: "",
      brand: "",
    });
  };

  const fetchMoreAddPricingListProducts = useCallback(async () => {
    if (
      productsIsLoadingMore ||
      !productsMeta?.has_next ||
      !productsMeta.cursor
    )
      return;

    setProductsIsLoadingMore(true);
    try {
      const response = await getPricingProductList({
        cursor: productsMeta.cursor,
        page_size: PAGE_SIZE,
        brand_ids: form.values.brand ? [Number(form.values.brand)] : undefined,
        sub_brand_ids: form.values.brandPillar
          ? [Number(form.values.brandPillar)]
          : undefined,
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
    productsIsLoadingMore,
    productsMeta,
    form.values.brand,
    form.values.brandPillar,
  ]);

  const isProductListLoading =
    isLoadingInitialProducts || isLoadingExistingPricingList;
  const noProductsFound =
    !isLoadingInitialProducts &&
    !initialProductsError &&
    productsData.length === 0 &&
    !productsHasMore;

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
                isLoadingInitialProducts ||
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
                  {...form.getInputProps("house")}
                  label="Filter house"
                  placeholder="Filter house"
                  data={houseOptions}
                  rightSection={<ChevronDownIcon />}
                  classNames={selectStyles}
                  searchable
                  clearable
                />
                <Select
                  {...form.getInputProps("brand")}
                  label="Filter brand"
                  placeholder="Filter brand"
                  data={brandOptions}
                  rightSection={<ChevronDownIcon />}
                  classNames={selectStyles}
                  searchable
                  clearable
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
                    No products found. Try adjusting filters or search term.
                  </p>
                  <p className="text-sm mt-1">
                    Alternatively, upload a product list.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-4">
                  <div className=" bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                    <AddPricingListProductTable
                      products={productsData}
                      selectedRow={selectedTableRow}
                      setSelectedRow={setSelectedTableRow}
                      fetchMoreData={fetchMoreAddPricingListProducts}
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
