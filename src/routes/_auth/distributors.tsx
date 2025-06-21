import { getDistributors } from "@/api/distributors/get-distributors";
import DistributorsTable from "@/components/Distributors/DistributorsTable";
import Filter from "@/components/HomePage/Filter";
import ImportIcon from "@/components/Icons/ImportIcon";
import PlusIcon from "@/components/Icons/PlusIcon";
import Headline from "@/components/Shared/Headline";
import { useLocalFilters } from "@/lib/hooks/useLocalFilters";
import { Filters } from "@/types";
import { Button, Group, Loader } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/distributors")({
  component: RouteComponent,
});

function RouteComponent() {
  const storageKey = `filters:${window.location.pathname}`;
    const [filters, setFilters] = useLocalFilters<Filters>(storageKey,{
      search: "",
      region_id: "",
      market_id: "",
      brand_id: "",
      sub_brand_id: "",
      distributor_id: "",
      brand_type: "",
    });


  const { data, isLoading, error } = useQuery({
    queryKey: ["distributors", filters], 
    queryFn: () =>
      getDistributors({
        cursor: 1,
        page_size: 20,
        filter: filters,
      }),
  });

  if (error || (!isLoading && !data)) {
    return (
      <div className="w-full">
        <Headline title="Distributors" />
        <div className="mt-8 p-6 bg-white rounded-lg text-red-500">
          Error loading distributors. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Headline title="Distributors" />
      <section className="mt-3 sm:mt-8">
        <Group justify="space-between" className="mb-4">
          <Group>
            {" "}
            <Button
              rightSection={<PlusIcon />}
              variant="default"
              className="border-none bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
              component={Link}
              to="/add-distributor"
            >
              Add new distributor
            </Button>
            <Button
              rightSection={<ImportIcon />}
              variant="default"
              className="border-none bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
              component={Link}
              to="#"
            >
              Import distributors
            </Button>
          </Group>
          <Button
            variant="default"
            className="border-none bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
            component={Link}
            to="/master-products"
          >
            Distributors vs Products master data view
          </Button>
        </Group>

        <Filter setFilters={setFilters} filters={filters} />

        {isLoading || !data ? (
          <div className="mt-5 p-6 bg-white rounded-lg flex justify-center">
            <Loader size="md" />
          </div>
        ) : (
          <DistributorsTable
            initialData={data.data}
            initialMeta={data.meta}
            filters={filters}
          />
        )}
      </section>
    </div>
  );
}
