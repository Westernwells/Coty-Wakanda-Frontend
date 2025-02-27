import AddInnovationForm from "@/components/AddInnovation/AddInnovationForm";
import AddOfferingForm from "@/components/AddInnovation/AddOfferingForm";
import ChevronDownIcon from "@/components/Icons/ChevronDownIcon";
import Headline from "@/components/Shared/Headline";
import { Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_auth/add-innovation")({
  component: RouteComponent,
});

function RouteComponent() {
  const [offeringOpen, setOfferingOpen] = useState(false);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      brand_id: "",
      sub_brand_id: "",
      year: new Date(),
      format: "",
      launch_name: "",
      other_name: "",
      document: "",
      forecast_deadline: new Date(),
    },
  });

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
      {!offeringOpen ? (
        <AddInnovationForm setOfferingOpen={setOfferingOpen} form={form} />
      ) : (
        <AddOfferingForm setOfferingOpen={setOfferingOpen} form={form} />
      )}
    </div>
  );
}
