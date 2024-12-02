import Filter from "@/components/HomePage/Filter";
import ProductsTable from "@/components/HomePage/ProductsTable";
import PlusIcon from "@/components/Icons/PlusIcon";
import Headline from "@/components/Shared/Headline";
import { Button } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="w-full">
            <Headline title="Products" />
            <section className="mt-3 sm:mt-8">
                <Button
                    rightSection={<PlusIcon />}
                    variant="default"
                    className="border-none bg-primary  border-s-e rounded-ee-xl  text-white text-sm font-medium px-[14px]  hover:bg-opacity-90 transition-all ease-in-out duration-300"
                    component={Link}
                    to="/add-product"
                >
                    Add new product
                </Button>
                <Filter isProductsPage />
                <ProductsTable />
            </section>
        </div>
    );
}
