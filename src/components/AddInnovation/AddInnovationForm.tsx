import { getBrandPillars } from "@/api/get-brandPillars";
import { getBrands } from "@/api/get-brands";
import { useAddInnovation } from "@/api/innovations/add-innovation";
import { useUpdateInnovation } from "@/api/innovations/update-innovation";
import { dateToLocalString } from "@/lib/utils";
import { queryClient } from "@/main";
import { Innovation, Product } from "@/types";
import { Button, Grid, Group, Select, Table, TextInput } from "@mantine/core";
import { YearPickerInput } from "@mantine/dates";
import { useForm, UseFormReturnType, zodResolver } from "@mantine/form";
import { useQueries } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { z } from "zod";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import PencilIcon from "../Icons/PencilIcon";
import { FormField } from "../Shared/Form/Field";
import { FileUploadSection } from "../Shared/Form/FileUploadSection";
import { FormSection } from "../Shared/Form/Section";
import { selectStyles, textInputStyles } from "../Shared/Styles";

type FormValues = {
  brand_id: string;
  sub_brand_id: string;
  year: Date;
  format: string;
  launch_name: string;
  other_name: string;
  document: string;
  forecast_deadline: Date;
  offerings?: {
    number: string;
    icw: Date;
    ocd: Date;
    type: string;
    deck: string;
    market_deck: string;
    products: Array<
      Partial<Product> & {
        currency: string;
      }
    >;
  }[];
};

const formSchema = z.object({
  brand_id: z.string().min(1, "Brand is required"),
  sub_brand_id: z.string().min(1, "Brand Pillar is required"),
  year: z.date(),
  format: z.string().min(1, "Format is required"),
  launch_name: z.string().min(1, "Launch name is required"),
  other_name: z.string().optional(),
  document: z.string().optional(),
  forecast_deadline: z.date(),
  offerings: z
    .array(
      z.object({
        number: z.string(),
        icw: z.date(),
        ocd: z.date(),
        type: z.string(),
        deck: z.string(),
        market_deck: z.string(),
        products: z.array(z.any()),
      })
    )
    .optional(),
});

const AddInnovationForm = forwardRef<
  { submit: () => void; isSubmitting: boolean },
  {
    setOfferingOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    setOfferingIndex?: React.Dispatch<React.SetStateAction<number>>;
    isEdit?: boolean;
    formData?: Innovation;
    innovationId?: string;
    form?: UseFormReturnType<FormValues>;
  }
>(
  (
    {
      setOfferingOpen,
      setOfferingIndex,
      isEdit = false,
      formData,
      innovationId,
      form: externalForm,
    },
    ref
  ) => {
    const navigate = useNavigate();
    const [selectedBrandId, setSelectedBrandId] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form if not provided externally
    const internalForm = useForm<FormValues>({
      validate: zodResolver(formSchema),
      initialValues: {
        brand_id: "",
        sub_brand_id: "",
        year: new Date(),
        format: "",
        launch_name: "",
        other_name: "",
        document: "",
        forecast_deadline: new Date(),
        offerings: [],
      },
    });

    // Use external form if provided, otherwise use internal form
    const form = externalForm || internalForm;

    const [{ data: brandsData }, { data: brandPillarsData }] = useQueries({
      queries: [
        { queryKey: ["brands"], queryFn: () => getBrands() },
        {
          queryKey: ["brandPillars", selectedBrandId],
          queryFn: () =>
            getBrandPillars({ filter: { brand_id: selectedBrandId } }),
          enabled: !!selectedBrandId,
        },
      ],
    });

    const addInnovationMutation = useAddInnovation({ mutationConfig: {} });
    const updateInnovationMutation = useUpdateInnovation({
      mutationConfig: {
        onSuccess: () => {
          setIsSubmitting(false);
          navigate({ to: "/innovations" });
        },
        onError: () => {
          setIsSubmitting(false);
        },
      },
    });

    // Expose submit function and isSubmitting state to parent via ref
    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
      isSubmitting,
    }));

    const handleSubmit = () => {
      const validation = form.validate();
      if (Object.keys(validation.errors).length > 0) {
        console.log("Form validation errors:", validation.errors);
        return;
      }

      setIsSubmitting(true);
      const values = form.getValues();
      const { year, forecast_deadline, offerings, ...toSubmit } = values;

      const submitData = {
        ...toSubmit,
        forecast_deadline: forecast_deadline.toISOString().split("T")[0],
        year: year?.getFullYear().toString(),
        offerings: offerings?.map((offering) => {
          return {
            ...offering,
            icw: offering.icw.toISOString().split("T")[0],
            ocd: offering.ocd.toISOString().split("T")[0],
          };
        }),
      };

      if (isEdit && innovationId) {
        updateInnovationMutation.mutate({
          innovationId: parseInt(innovationId),
          data: submitData,
        });
      } else {
        addInnovationMutation.mutate(
          { data: submitData },
          {
            onSuccess: () => {
              setIsSubmitting(false);
              navigate({ to: "/innovations" });
            },
            onError: () => {
              setIsSubmitting(false);
            },
          }
        );
      }
    };

    // Set form values when editing
    useEffect(() => {
      if (formData && isEdit) {
        const brandId = formData.brand.id.toString();
        form.setValues({
          brand_id: brandId,
          sub_brand_id: formData.brand_pillar.id.toString(),
          year: new Date(parseInt(formData.year), 0, 1),
          format: formData.format,
          launch_name: formData.launch_name,
          other_name: formData.launch_ref, // assuming this maps to other_name
          document: "",
          forecast_deadline: new Date(formData.forecast_deadline),
          offerings: [],
        });
        setSelectedBrandId(brandId);
      }
    }, [formData, isEdit]);

    // Handle brand change to clear sub_brand_id and update selected brand
    const handleBrandChange = (brandId: string | null) => {
      const newBrandId = brandId || "";
      form.setFieldValue("brand_id", newBrandId);
      // Always reset brand pillar when brand changes
      form.setFieldValue("sub_brand_id", "");
      // Clear any existing validation errors for sub_brand_id
      form.clearFieldError("sub_brand_id");
      setSelectedBrandId(newBrandId);
    };

    return (
      <form onSubmit={form.onSubmit(handleSubmit)}>
        {/* <DateInput
        {...form.getInputProps("forecast_deadline")}
        label="Forecast deadline"
        valueFormat="YYYY MMM DD"
        placeholder="Select date"
        rightSection={<DateIcon />}
        className="sm:max-w-[50%]"
        classNames={textInputStyles}
      /> */}
        <FormSection title="General Details">
          <Grid
            gutter={{
              sm: 32,
              base: 16,
            }}
          >
            <Grid.Col
              span={{
                sm: 6,
                base: 12,
              }}
            >
              <Select
                value={form.getValues().brand_id}
                onChange={handleBrandChange}
                error={form.errors.brand_id}
                placeholder="Select brand"
                label="Brand"
                data={
                  brandsData?.data?.map((brand) => ({
                    value: brand.id.toString(),
                    label: brand.name,
                  })) || []
                }
                rightSection={<ChevronDownIcon />}
                classNames={selectStyles}
                clearable
                searchable
              />
            </Grid.Col>
            <Grid.Col
              span={{
                sm: 6,
                base: 12,
              }}
            >
              <Select
                value={form.getValues().sub_brand_id}
                onChange={(value) =>
                  form.setFieldValue("sub_brand_id", value || "")
                }
                error={form.errors.sub_brand_id}
                placeholder="Select brand Pillar"
                label="Brand Pillar"
                disabled={
                  form.getValues().brand_id === "" ||
                  brandPillarsData?.data.length === 0
                }
                data={
                  brandPillarsData?.data?.map((pillar) => ({
                    value: pillar.id.toString(),
                    label: pillar.name,
                  })) || []
                }
                rightSection={<ChevronDownIcon />}
                classNames={selectStyles}
                clearable
                searchable
              />
            </Grid.Col>
            <Grid.Col
              span={{
                sm: 6,
                base: 12,
              }}
            >
              <YearPickerInput
                label="Year"
                {...form.getInputProps("year")}
                placeholder="Pick Year"
                valueFormat="YYYY"
                classNames={selectStyles}
              />
            </Grid.Col>
            <Grid.Col
              span={{
                sm: 6,
                base: 12,
              }}
            >
              <Select
                {...form.getInputProps("format")}
                placeholder="Select Format"
                label="Format"
                data={[
                  { label: "format", value: "format1" },
                  { label: "unformat", value: "format2" },
                ]}
                rightSection={<ChevronDownIcon />}
                classNames={selectStyles}
                clearable
                searchable
              />
            </Grid.Col>
          </Grid>
        </FormSection>

        <FormSection title="Custom Details">
          <Grid
            gutter={{
              sm: 32,
              base: 16,
            }}
          >
            <Grid.Col
              span={{
                sm: 6,
                base: 12,
              }}
            >
              <TextInput
                {...form.getInputProps("launch_ref")}
                label="Launch ref"
                placeholder="000000"
                classNames={textInputStyles}
                disabled
              />
            </Grid.Col>
            <Grid.Col
              span={{
                sm: 6,
                base: 12,
              }}
            >
              <TextInput
                {...form.getInputProps("launch_id")}
                label="Launch ID"
                placeholder="Brand-SubBrand-Year-Format-LaunchName"
                classNames={textInputStyles}
                disabled
              />
            </Grid.Col>
            <Grid.Col
              span={{
                sm: 6,
                base: 12,
              }}
            >
              <TextInput
                {...form.getInputProps("launch_name")}
                label="Launch Name"
                placeholder="Enter Name"
                classNames={textInputStyles}
              />
            </Grid.Col>
            <Grid.Col
              span={{
                sm: 6,
                base: 12,
              }}
            >
              <TextInput
                {...form.getInputProps("other_name")}
                label="Other reference names"
                placeholder="Enter reference name"
                classNames={textInputStyles}
              />
            </Grid.Col>
          </Grid>
        </FormSection>
        <FormSection title="Custom Details">
          <Grid
            gutter={{
              sm: 32,
              base: 16,
            }}
          >
            {form.getValues().offerings && (
              <Grid.Col span={12}>
                <div className="relative border border-primary rounded-xl border-t-0">
                  <Table.ScrollContainer minWidth={768}>
                    <Table
                      verticalSpacing="sm"
                      borderColor="transparent"
                      striped="even"
                      stripedColor="#F2F4F6"
                    >
                      <Table.Thead>
                        <Table.Tr className="bg-primary text-white">
                          <Table.Th className="rounded-ss-xl">
                            Offering Number
                          </Table.Th>
                          <Table.Th>Deadline for forecast</Table.Th>
                          <Table.Th>Global ICW</Table.Th>
                          <Table.Th>Type</Table.Th>
                          <Table.Th className="rounded-se-xl"></Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {form.getValues().offerings?.map((offering, index) => (
                          <Table.Tr key={offering.number}>
                            <Table.Td className="rounded-ss-xl">
                              {offering.number}
                            </Table.Td>
                            <Table.Td>
                              {dateToLocalString(offering.icw)}
                            </Table.Td>
                            <Table.Td>
                              {dateToLocalString(offering.icw)}
                            </Table.Td>
                            <Table.Td>{offering.type}</Table.Td>
                            <Table.Td
                              className="rounded-se-xl cursor-pointer"
                              onClick={() => {
                                setOfferingIndex?.(index);
                                setOfferingOpen?.(true);
                              }}
                            >
                              <PencilIcon />
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>
                </div>
              </Grid.Col>
            )}
            <Grid.Col
              span={{
                lg: 6,
                base: 12,
              }}
            >
              <FormField label="Add new offering">
                <Button
                  variant="outline"
                  className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                  leftSection={<PlusIcon size={24} />}
                  onClick={() => {
                    if (form.getValues().offerings?.length) {
                      form.insertListItem("offerings", {
                        number: "",
                        icw: new Date(),
                        ocd: new Date(),
                        type: "",
                        deck: "",
                        market_deck: "",
                        products: [],
                      });
                    } else {
                      form.setFieldValue("offerings", [
                        {
                          number: "",
                          icw: new Date(),
                          ocd: new Date(),
                          type: "",
                          deck: "",
                          market_deck: "",
                          products: [],
                        },
                      ]);
                    }
                    setOfferingOpen?.(true);
                  }}
                >
                  Add Offering
                </Button>
              </FormField>
            </Grid.Col>
            <Grid.Col
              span={{
                lg: 6,
                base: 12,
              }}
            >
              <FileUploadSection
                form={form}
                id="offering_file"
                multiple={true}
                accept="application/vnd.ms-excel, text/csv"
              />
            </Grid.Col>
          </Grid>
        </FormSection>
      </form>
    );
  }
);

export default AddInnovationForm;
