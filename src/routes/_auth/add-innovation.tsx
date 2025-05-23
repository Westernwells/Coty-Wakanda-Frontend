import AddInnovationForm from "@/components/AddInnovation/AddInnovationForm";
import AddOfferingForm from "@/components/AddInnovation/AddOfferingForm";
import ChevronDownIcon from "@/components/Icons/ChevronDownIcon";
import Headline from "@/components/Shared/Headline";
import { Button } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

export const Route = createFileRoute("/_auth/add-innovation")({
  component: RouteComponent,
});

function RouteComponent() {
  const [offeringOpen, setOfferingOpen] = useState(false);
  const [offeringIndex, setOfferingIndex] = useState(-1);
  const [productOpen, setProductOpen] = useState(false);

  const schema = z.object({
    brand_id: z
      .string({
        message: "Brand Is required",
      })
      .min(1, "Brand Is required"),
    launch_name: z
      .string({
        message: "Brand Is required",
      })
      .min(1, "Launch Name is required"),
    other_name: z
      .string({
        message: "Brand Is required",
      })
      .min(1, "Launch Name is required"),
    format: z
      .string({
        message: "Format is required",
      })
      .min(1, "Launch Name is required"),
    sub_brand_id: z
      .string({
        message: "Sub Brand Is required",
      })
      .min(1, "sub brand is required"),
    year: z.date({
      message: "Brand Is required",
    }),
    offerings: z
      .array(
        z.object({
          number: z
            .string({
              message: "Offering Number is required",
            })
            .min(1, "offering number is required"),
          icw: z.date({
            message: "Global ICW is required",
          }),
          ocd: z.date({
            message: "Global OCD is required",
          }),
          type: z.string().min(1, "Type is required"),
        })
      )
      .optional(),
  });
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
    validate: zodResolver(schema),
  });

  return (
    <div className="w-full">
      <Headline
        title={
          productOpen
            ? "Add IRC Product"
            : offeringOpen
              ? "Add Offering"
              : "Create Innovation"
        }
      />

      <section className="mt-3 sm:mt-8">
        <Button
          leftSection={
            <div className="rotate-90">
              <ChevronDownIcon />
            </div>
          }
          variant="default"
          className="border-none bg-transparent   text-primary text-sm font-medium  p-0 before:content-none"
          component={!offeringOpen ? Link : undefined}
          to={!offeringOpen ? "/innovations" : undefined}
          onClick={() => {
            if (productOpen) {
              // If in product form, go back to offering
              setProductOpen(false);
            } else if (offeringOpen) {
              // If in offering form, go back to innovation
              setOfferingOpen(false);
            }
            // If in innovation form, Link component handles navigation to /innovations
          }}
        >
          {productOpen
            ? "Back to Offering"
            : offeringOpen
              ? "Back to Innovation"
              : "Back to Innovations"}
        </Button>
      </section>
      {!offeringOpen ? (
        <AddInnovationForm
          setOfferingOpen={setOfferingOpen}
          setOfferingIndex={setOfferingIndex}
          form={form}
        />
      ) : (
        <AddOfferingForm
          setOfferingOpen={setOfferingOpen}
          offeringIndex={offeringIndex}
          form={form}
          onProductOpenChange={setProductOpen}
        />
      )}
    </div>
  );
}
