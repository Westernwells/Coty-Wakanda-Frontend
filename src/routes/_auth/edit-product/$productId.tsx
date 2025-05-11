import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";

import AddProductForm from "@/components/AddProduct/Form";
import { Button } from "@mantine/core";
import { ChevronDownIcon, XIcon } from "lucide-react";
import Headline from "@/components/Shared/Headline";
import { useQuery } from "@tanstack/react-query";
import { getProduct } from "@/api/products/get-product";
import LoadingSpinner from "@/components/Shared/LoadingSpinner";

export const Route = createFileRoute("/_auth/edit-product/$productId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const formRef = useRef<{ submit: () => void; isSubmitting: boolean }>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["products", productId],
    queryFn: () => getProduct(productId),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full">
      <Headline title="Edit product" />
      <section className="mt-3 sm:mt-8 flex justify-between items-center">
        <Button
          leftSection={
            <div className="rotate-90">
              <ChevronDownIcon />
            </div>
          }
          variant="default"
          className="border-none bg-transparent   text-primary text-sm font-medium  p-0 before:content-none"
          component={Link}
          to="/products"
        >
          Back to Product
        </Button>
        <div className="flex items-center gap-x-2">
          <Button
            leftSection={<XIcon />}
            onClick={() => {
              navigate({ to: "/products" });
            }}
            variant="outline"
            className="border-primary  border-s-e rounded-ee-xl text-primary text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            className="border-none w-28 bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
            onClick={() => formRef.current?.submit()}
            loading={formRef.current?.isSubmitting}
            disabled={formRef.current?.isSubmitting}
          >
            {formRef.current?.isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </section>
      <AddProductForm ref={formRef} product={data?.data} isEdit />
    </div>
  );
}
