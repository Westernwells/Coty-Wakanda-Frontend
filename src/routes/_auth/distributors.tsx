import { Button, Group, Loader } from "@mantine/core";
import { Link, createFileRoute } from "@tanstack/react-router";
import DistributorsTable from "@/components/Distributors/DistributorsTable";
import Filter from "@/components/HomePage/Filter";
import Headline from "@/components/Shared/Headline";
import ImportIcon from "@/components/Icons/ImportIcon";
import PlusIcon from "@/components/Icons/PlusIcon";
import { getDistributors } from "@/api/distributors/get-distributors";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Filters } from "@/types";

export const Route = createFileRoute("/_auth/distributors")({
    component: RouteComponent,
});

function RouteComponent() {
    const [filter, setFilter] = useState<Filters>({
        search: "",
        region_id: "",
        market_id: "",
        brand_id: "",
        sub_brand_id: "",
        distributor_id: "",
        brand_type: "",
    });

    const { data, isLoading, error } = useQuery({
        queryKey: ["distributors", filter], // ✅ Filters trigger refetch
        queryFn: () =>
            getDistributors({
                cursor: 1,
                page_size: 20,
                filter,
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

                <Filter setFilters={setFilter} />

                {isLoading || !data ? (
                    <div className="mt-5 p-6 bg-white rounded-lg flex justify-center">
                        <Loader size="md" />
                    </div>
                ) : (
                    <DistributorsTable
                        initialData={data.data}
                        initialMeta={data.meta}
                        filters={filter}
                    />
                )}
            </section>
        </div>
    );
}
