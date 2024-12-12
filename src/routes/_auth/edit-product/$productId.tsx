import { Link, createFileRoute } from "@tanstack/react-router";

import AddProductForm from "@/components/AddProduct/Form";
import { Button } from "@mantine/core";
import { ChevronDownIcon } from "lucide-react";
import Headline from "@/components/Shared/Headline";

export const Route = createFileRoute("/_auth/edit-product/$productId")({
    component: RouteComponent,
});

function RouteComponent() {
    // const { productId } = Route.useParams()
    return (
        <div className="w-full">
            <Headline title="Edit product" />
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
                    to=".."
                >
                    Back to Product
                </Button>
            </section>
            <AddProductForm />
        </div>
    );
}
