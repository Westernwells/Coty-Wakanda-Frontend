import DistributorsTable from "@/components/Distributors/Table";
import Filter from "@/components/HomePage/Filter";
import ImportIcon from "@/components/Icons/ImportIcon";
import PlusIcon from "@/components/Icons/PlusIcon";
import Headline from "@/components/Shared/Headline";
import { Button, Group } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
export const Route = createFileRoute("/distributors")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="w-full">
            <Headline title="Distributors" />
            <section className="mt-3 sm:mt-8">
                <Group>
                    <Button
                        rightSection={<PlusIcon />}
                        variant="default"
                        className="border-none bg-primary  border-s-e rounded-ee-xl  text-white text-sm font-medium px-[14px]  hover:bg-opacity-90 transition-all ease-in-out duration-300"
                        component={Link}
                        to="/add-distributor"
                    >
                        Add new distributor
                    </Button>
                    <Button
                        rightSection={<ImportIcon />}
                        variant="default"
                        className="border-none bg-primary  border-s-e rounded-ee-xl  text-white text-sm font-medium px-[14px]  hover:bg-opacity-90 transition-all ease-in-out duration-300"
                        component={Link}
                        to="#"
                    >
                        Import distributors
                    </Button>
                </Group>

                <Filter />
                <DistributorsTable />
            </section>
        </div>
    );
}
