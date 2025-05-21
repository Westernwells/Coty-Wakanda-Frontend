import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@mantine/core";
import ChevronDownIcon from "@/components/Icons/ChevronDownIcon";
import Headline from "@/components/Shared/Headline";
import AddDistributorForm from "@/components/Distributors/AddDistributorForm";

export const Route = createFileRoute("/_auth/add-distributor")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full">
      <Headline title="Add distributor" />
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
      <AddDistributorForm isEdit={false} />
    </div>
  );
}
