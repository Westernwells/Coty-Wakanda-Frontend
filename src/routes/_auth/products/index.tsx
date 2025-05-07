import { getProducts } from "@/api/products/get-products";
import Filter from "@/components/HomePage/Filter";
import ProductsTable from "@/components/HomePage/ProductsTable";
import PlusIcon from "@/components/Icons/PlusIcon";
import Headline from "@/components/Shared/Headline";
import { useUserStore } from "@/stores/userStore";
import { Filters } from "@/types";
import { Button, Group, Loader } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CSVLink } from "react-csv";
import { useBulkProductCsvDownload } from "@/components/HomePage/useBulkProductCsvDownload";
import BulkActionsDropdown from "@/components/HomePage/BulkActionsDropdown";

export const Route = createFileRoute("/_auth/products/")({
  component: RouteComponent,
});

function RouteComponent() {
  const userData = useUserStore((state) => state.user);
  const [isEdit, setIsEdit] = useState(false);
  const [filter, setFilter] = useState<Filters>({
    search: "",
    region_id: "",
    market_id: "",
    brand_id: "",
    sub_brand_id: "",
    distributor_id: "",
    division: "",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", filter], // ✅ Filters trigger refetch
    queryFn: () =>
      getProducts({
        cursor: 1,
        page_size: 20,
        filter,
      }),
  });

  const handleBulkUpload = () => {
    console.log("handleBulkUpload");
  };

  const handleBulkEdit = () => {
    setIsEdit(true);
  };

  // Bulk CSV download logic for main button
  const mainCsv = useBulkProductCsvDownload();
  // Bulk CSV download logic for dropdown
  const bulkCsv = useBulkProductCsvDownload();

  if (error || (!isLoading && !data)) {
    return (
      <div className="w-full">
        <Headline title="Products" />
        <div className="mt-8 p-6 bg-white rounded-lg text-red-500">
          Error loading products. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Headline title="Products" />
      <section className="mt-3 sm:mt-8">
        <Group className="flex items-center gap-3 w-full">
          <BulkActionsDropdown
            csvData={bulkCsv.csvData}
            csvHeaders={bulkCsv.csvHeaders}
            csvError={bulkCsv.csvError}
            csvLoading={bulkCsv.csvLoading}
            csvReady={bulkCsv.csvReady}
            csvLinkRef={bulkCsv.csvLinkRef}
            handleBulkDownload={bulkCsv.handleBulkDownload}
            handleBulkUpload={handleBulkUpload}
            handleBulkEdit={handleBulkEdit}
          />
          {userData?.role !== "distributor" && (
            <Button
              rightSection={<PlusIcon />}
              variant="default"
              className="border-none bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
              component={Link}
              to="/add-product"
            >
              Add new product
            </Button>
          )}
          <div className="flex-1" />
          <Button
            variant="default"
            className="border-none bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
            leftSection={
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="17"
                  viewBox="0 0 12 17"
                  fill="none"
                >
                  <path
                    d="M1 16H11M6 1V12.6667M6 12.6667L10.1667 8.5M6 12.6667L1.83333 8.5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            }
            type="button"
            onClick={mainCsv.handleBulkDownload}
            disabled={mainCsv.csvLoading}
          >
            {mainCsv.csvLoading ? (
              <span className="inline-flex items-center animate-pulse">
                Downloading
                <span className="ml-1 inline-block">
                  <span className="dot-1">.</span>
                  <span className="dot-2">.</span>
                  <span className="dot-3">.</span>
                </span>
              </span>
            ) : (
              "Download csv"
            )}
          </Button>
          {/* Hidden CSVLink for download trigger */}
          {mainCsv.csvReady && (
            <CSVLink
              data={mainCsv.csvData}
              headers={mainCsv.csvHeaders}
              filename="all-products.csv"
              ref={mainCsv.csvLinkRef}
              className="hidden"
              target="_blank"
            />
          )}
        </Group>

        <Filter isProductsPage setFilters={setFilter} />

        {isLoading || !data ? (
          <div className="mt-5 p-6 bg-white rounded-lg flex justify-center">
            <Loader size="md" />
          </div>
        ) : (
          <ProductsTable
            initialData={data.data}
            initialMeta={data.meta}
            filters={filter}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
          />
        )}
      </section>
    </div>
  );
}
