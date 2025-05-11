import { getMasterData } from "@/api/products/master-data";
import MasterDataViewModal from "@/components/Distributors/MasterDataViewModal";
import MasterProductFilters from "@/components/Distributors/MasterProductsFilter";
import Headline from "@/components/Shared/Headline";
import type { MasterProductFilters as MasterProductFiltersType } from "@/types";
import { Button, Loader } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_auth/product-list")({
  component: RouteComponent,
});

function RouteComponent() {
  const [filter, setFilter] = useState<MasterProductFiltersType>({
    search: "",
    house: "",
    brand_id: "",
    distributor_id: "",
  });
  const { data, isLoading, error } = useQuery({
    queryKey: ["masterData", filter],
    queryFn: () =>
      getMasterData({
        cursor: 1,
        page_size: 20,
        filter,
      }),
  });

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
        <MasterProductFilters setFilters={setFilter} />

        {isLoading || !data ? (
          <div className="mt-5 p-6 bg-white rounded-lg flex justify-center">
            <Loader size="md" />
          </div>
        ) : (
          <MasterDataViewModal
            initialData={data.data}
            initialMeta={data.meta}
            filters={filter}
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
