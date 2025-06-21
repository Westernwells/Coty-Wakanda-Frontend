import { useMasterData } from "@/api/products/master-data";
import MasterDataViewModal from "@/components/Distributors/MasterDataViewModal";
import MasterProductFilters from "@/components/Distributors/MasterProductsFilter";
import Headline from "@/components/Shared/Headline";
import { useLocalFilters } from "@/lib/hooks/useLocalFilters";
import type { MasterDistributor, MasterProduct, MasterProductFilters as MasterProductFiltersType } from "@/types";
import { mergeByIdConcatData } from "@/utils/masterData";
import { Button, Loader } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDownIcon } from "lucide-react";

export const Route = createFileRoute("/_auth/product-list")({
  component: RouteComponent,
});

function RouteComponent() {
    const storageKey = `filters:${window.location.pathname}`;

  const [filters, setFilters] = useLocalFilters<MasterProductFiltersType>(storageKey, {
    search: "",
    house: "",
    brand_id: "",
    distributor_id: "",
  });

  const {data, fetchNextPage, hasNextPage, error, isFetchingNextPage, isLoading} = useMasterData({
    cursor: 1,
    page_size: 20,
    filter: filters,
  });

  const datafFromMd = data?.pages?.flatMap((page) => page?.data) || [];
  const products     = datafFromMd?.flatMap(p => p?.products)     ?? [];
  const distributors = datafFromMd?.flatMap(p => p?.distributors) ?? [];

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
      <Headline title="Product List" />
      <section className="mt-3 sm:mt-8">
        <Button
          leftSection={
            <div className="rotate-90">
              <ChevronDownIcon />
            </div>
          }
          variant="default"
          className="border-none bg-transparent   text-primary text-sm font-medium  p-0 before:content-none"
          component={Link}
          to="/distributors"
        >
          Back to Distributors
        </Button>
      </section>
      <section className="mt-3 sm:mt-8">
        <MasterProductFilters setFilters={setFilters} filters={filters}/>

        {isLoading || !data ? (
          <div className="mt-5 p-6 bg-white rounded-lg flex justify-center">
            <Loader size="md" />
          </div>
        ) : (
          <MasterDataViewModal
          hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            products={products as unknown as MasterProduct[]}
            distributors={mergeByIdConcatData(distributors) as MasterDistributor[]}
            isLoading={isLoading}
            error={error}
            isFetchingNextPage={isFetchingNextPage}
            filters={filters}
            tableHeader={[
              "French EUR",
              "French USD",
              "Regional Price USD",
              "Regional Price EUR",
              "C1 Price",
            ]}
            tableFields={[
              "french_eur",
              "french_usd",
              "regional_price_usd",
              "regional_price_eur",
              "c1",
            ]}
          />
        )}
      </section>
    </div>
  );
}
