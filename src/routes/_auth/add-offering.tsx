import AddOfferingForm from "@/components/AddInnovation/AddOfferingForm";
import ChevronDownIcon from "@/components/Icons/ChevronDownIcon";
import Headline from "@/components/Shared/Headline";
import { Button } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/add-offering")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full">
      <Headline title="Create Innovation" />
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
          to="/innovations"
        >
          Back to Innovations
        </Button>
      </section>
      <AddOfferingForm />
    </div>
  );
}
