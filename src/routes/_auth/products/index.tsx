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
        <Group className="flex items-center gap-3">
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

          <Button
            variant="default"
            className="border-none bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
            component={Link}
            to="#"
          >
            Trex Upload / Update
          </Button>
          <Button
            variant="default"
            className="border-none bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
            onClick={() => setIsEdit(true)}
          >
            Edit Prices
          </Button>
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
