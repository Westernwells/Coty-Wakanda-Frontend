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
import { Download, Upload } from "lucide-react";
import { CSVLink } from "react-csv";
import ChevronDownIcon from "@/components/Icons/ChevronDownIcon";
import ExitIcon from "@/components/Icons/ExitIcon";
import SearchIcon from "@/components/Icons/SearchIcon";
import { selectStyles, textInputStyles } from "@/components/Shared/Styles";
import { useAddBillingList } from "@/api/billingList/add-billing-list";
import { useState, useEffect, useCallback } from "react";
import { twMerge } from "tailwind-merge";
import AddBillingListProductTable from "@/components/AddBillingList/AddBillingListProductTable";
import AddBillingListDistributorPrices from "@/components/AddBillingList/AddBillingListDistributorPrices";
import type {
  MasterProduct,
  MasterDistributor,
  MasterProductFilters as MasterProductFiltersType,
  Meta,
} from "@/types";
import { getMasterData } from "@/api/products/master-data";
import Headline from "@/components/Shared/Headline";
import { useBillingListProductCsvDownload } from "@/lib/hooks/useBillingListProductCsvDownload";

export const Route = createFileRoute("/_auth/settings/add-billing-list")({
  component: AddBillingListComponent,
});

interface BillingListFormValues {
  name: string;
  type: string;
  description: string;
  house: string;
  brand: string;
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

  const [productsData, setProductsData] = useState<MasterProduct[]>([]);
  const [distributorsData, setDistributorsData] = useState<MasterDistributor[]>(
    []
  );
  const [selectedTableRow, setSelectedTableRow] = useState<string | null>(null);
  const [productsMeta, setProductsMeta] = useState<Meta | null>(null);
  const [productsHasMore, setProductsHasMore] = useState(false);
  const [productsIsLoadingMore, setProductsIsLoadingMore] = useState(false);

  const [houseOptions, setHouseOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [brandOptions, setBrandOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [apiFilters, setApiFilters] = useState<MasterProductFiltersType>({
    search: "",
    house: "",
    brand_id: "",
    distributor_id: "",
  });

  const { csvData, csvHeaders, csvLoading, csvLinkRef, handleBulkDownload } =
    useBillingListProductCsvDownload(apiFilters);

  const form = useForm<BillingListFormValues>({
    initialValues: {
      name: "",
      type: "",
      description: "",
      house: "",
      brand: "",
      selectedProductsWithPrices: [],
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : "Name is required"),
      type: (value) => (value ? null : "Type is required"),
    },
  });

  useEffect(() => {
    setApiFilters({
      search: searchTerm,
      brand_id: form.values.brand || "",
      house: form.values.house || "",
      distributor_id: "",
    });
    setProductsData([]);
    setDistributorsData([]);
    setProductsMeta(null);
    setSelectedTableRow(null);
  }, [searchTerm, form.values.brand, form.values.house]);

  const {
    isLoading: isLoadingInitialProducts,
    error: initialProductsError,
    data: initialMasterDataResult,
  } = useQuery<Awaited<ReturnType<typeof getMasterData>>, Error>({
    queryKey: ["masterDataForAddBillingList", apiFilters],
    queryFn: () =>
      getMasterData({ cursor: 1, page_size: PAGE_SIZE, filter: apiFilters }),
    enabled: true,
  });

  useEffect(() => {
    if (initialMasterDataResult?.data) {
      setProductsData(initialMasterDataResult.data.products);
      setDistributorsData(initialMasterDataResult.data.distributors);
      setProductsMeta(initialMasterDataResult.meta);
      setProductsHasMore(initialMasterDataResult.meta.has_next);
    } else if (
      !isLoadingInitialProducts &&
      initialMasterDataResult === undefined
    ) {
      setProductsData([]);
      setDistributorsData([]);
      setProductsMeta(null);
      setProductsHasMore(false);
    }
  }, [initialMasterDataResult, isLoadingInitialProducts]);

  useEffect(() => {
    if (productsData && productsData.length > 0) {
      const uniqueHouses = Array.from(
        new Set(productsData.map((p) => p.house).filter(Boolean))
      );
      setHouseOptions(
        uniqueHouses.map((house) => ({ value: house, label: house }))
      );

      const uniqueBrands = Array.from(
        new Set(productsData.map((p) => p.brand_line).filter(Boolean))
      );
      setBrandOptions(
        uniqueBrands.map((brand) => ({ value: brand, label: brand }))
      );
    } else {
      setHouseOptions([]);
      setBrandOptions([]);
    }
  }, [productsData]);

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
      house: "",
      brand: "",
    });
  };

  const fetchMoreAddBillingListProducts = useCallback(async () => {
    if (
      productsIsLoadingMore ||
      !productsMeta?.has_next ||
      !productsMeta.cursor
    )
      return;

    setProductsIsLoadingMore(true);
    try {
      const response = await getMasterData({
        cursor: productsMeta.cursor,
        page_size: PAGE_SIZE,
        filter: apiFilters,
      });
      setProductsData((prev) => [...prev, ...response.data.products]);
      setDistributorsData((prev) => {
        const existingDistributorIds = new Set(prev.map((d) => d.id));
        const newDistributors = response.data.distributors.filter(
          (dist) => !existingDistributorIds.has(dist.id)
        );
        return [...prev, ...newDistributors];
      });
      setProductsMeta(response.meta);
      setProductsHasMore(response.meta.has_next);
    } catch (error) {
      console.error("Error fetching more product data:", error);
    } finally {
      setProductsIsLoadingMore(false);
    }
  }, [productsIsLoadingMore, productsMeta, apiFilters]);

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
                    onClick={handleBulkDownload}
                    loading={csvLoading}
                    disabled={csvLoading}
                  >
                    Download list
                  </Button>
                  {csvData.length > 0 && (
                    <CSVLink
                      data={csvData}
                      headers={csvHeaders}
                      filename="billing_list_products.csv"
                      className="hidden"
                      ref={csvLinkRef}
                      target="_blank"
                    />
                  )}
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
                  <div className="lg:col-span-3 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                    <AddBillingListProductTable
                      products={productsData}
                      selectedRow={selectedTableRow}
                      setSelectedRow={setSelectedTableRow}
                      fetchMoreData={fetchMoreAddBillingListProducts}
                      hasMore={productsHasMore}
                      isLoadingMore={productsIsLoadingMore}
                    />
                  </div>
                  <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                    <AddBillingListDistributorPrices
                      distributors={distributorsData}
                      selectedRow={selectedTableRow}
                      setSelectedRow={setSelectedTableRow}
                      tableHeader={["Base Price"]}
                      tableFields={["billing_price"]}
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
