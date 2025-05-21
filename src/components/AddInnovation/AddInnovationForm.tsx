import { getBrandPillars } from "@/api/get-brandPillars";
import { getBrands } from "@/api/get-brands";
import { useAddInnovation } from "@/api/innovations/add-innovation";
import { dateToLocalString } from "@/lib/utils";
import { queryClient } from "@/main";
import { Product } from "@/types";
import { Button, Grid, Group, Select, Table, TextInput } from "@mantine/core";
import { YearPickerInput } from "@mantine/dates";
import { UseFormReturnType } from "@mantine/form";
import { useQueries } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import PencilIcon from "../Icons/PencilIcon";
import { FormField } from "../Shared/Form/Field";
import { FileUploadSection } from "../Shared/Form/FileUploadSection";
import { FormSection } from "../Shared/Form/Section";
import { selectStyles, textInputStyles } from "../Shared/Styles";

const AddInnovationForm = ({
  setOfferingOpen,
  form,
  setOfferingIndex,
}: {
  setOfferingOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setOfferingIndex: React.Dispatch<React.SetStateAction<number>>;
  form: UseFormReturnType<{
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
  }>;
}) => {
  const [{ data: brandsData }, { data: brandPillarsData }] = useQueries({
    queries: [
      { queryKey: ["brands"], queryFn: () => getBrands() },
      {
        queryKey: ["brandPillars"],
        queryFn: () =>
          getBrandPillars({ filter: { brand_id: form.getValues().brand_id } }),
        enabled: !!form.getValues().brand_id,
      },
    ],
  });
  const navigate = useNavigate();

  const addInnovationMutation = useAddInnovation({ mutationConfig: {} });

  form.watch("brand_id", () => {
    queryClient.invalidateQueries({
      queryKey: ["brandPillars"],
      exact: false,
      refetchType: "all",
    });
    form.setFieldValue("sub_brand_id", "");
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        if (Object.keys(form.validate().errors).length === 0) {
          form.validate();
          const { year, forecast_deadline, offerings, ...toSubmit } = values;
          addInnovationMutation.mutate(
            {
              data: {
                ...toSubmit,
                forecast_deadline: forecast_deadline
                  .toISOString()
                  .split("T")[0],
                year: year?.getFullYear().toString(),
                offerings: offerings?.map((offering) => {
                  return {
                    ...offering,
                    icw: offering.icw.toISOString().split("T")[0],
                    ocd: offering.ocd.toISOString().split("T")[0],
                  };
                }),
              },
            },
            {
              onSuccess: () => navigate({ to: "/innovations" }),
            }
          );
        }
      })}
    >
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
              {...form.getInputProps("brand_id")}
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
              {...form.getInputProps("sub_brand_id")}
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
                          <Table.Td>{dateToLocalString(offering.icw)}</Table.Td>
                          <Table.Td>{dateToLocalString(offering.icw)}</Table.Td>
                          <Table.Td>{offering.type}</Table.Td>
                          <Table.Td
                            className="rounded-se-xl cursor-pointer"
                            onClick={() => {
                              setOfferingIndex(index);
                              setOfferingOpen(true);
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
                  setOfferingOpen(true);
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
      <Group justify="flex-end" mt="md">
        <Button type="submit">Submit</Button>
      </Group>
    </form>
  );
};

export default AddInnovationForm;
