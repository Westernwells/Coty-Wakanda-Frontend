import { Button, Grid, Group, Select, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import { FormSection } from "../Shared/Form/Section";
import { FormField } from "../Shared/Form/Field";
import DateIcon from "../Icons/DateIcon";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { FileUploadSection } from "../Shared/Form/FileUploadSection";
import { getBrands } from "@/api/get-brands";
import { getBrandPillars } from "@/api/get-brandPillars";
import { useQueries } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { selectStyles, textInputStyles } from "../Shared/Styles";

const AddInnovationForm = () => {
  const form = useForm({
    initialValues: {
      brand: "",
      brand_pillar: "",
      year: "",
      format: "",
      launch_id: "",
      launch_ref: "",
      launch_name: "",
      refrence_names: "",
      document: "",
      deadline: "",
    },
  });

  const [{ data: brandsData }, { data: brandPillarsData }] = useQueries({
    queries: [
      { queryKey: ["brands"], queryFn: getBrands },
      { queryKey: ["brandPillars"], queryFn: getBrandPillars },
    ],
  });


  return (
    <form
      onSubmit={form.onSubmit((values) => {
        console.log("submitted");
        console.log(values);
      })}
    >
      <DateInput
        {...form.getInputProps("deadline")}
        label="Forecast deadline"
        valueFormat="YYYY MMM DD"
        placeholder="Select date"
        rightSection={<DateIcon />}
        className="sm:max-w-[50%]"
        classNames={textInputStyles}
      />
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
              {...form.getInputProps("brand")}
              placeholder="Select brand"
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
              {...form.getInputProps("brand_pillar")}
              placeholder="Select brand Pillar"
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
            <Select
              {...form.getInputProps("year")}
              placeholder="Select year"
              data={[
                { label: "2020", value: "2020" },
                { label: "2021", value: "2021" },
              ]}
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
              {...form.getInputProps("format")}
              placeholder="Select Format"
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
              {...form.getInputProps("refrence_names")}
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
                component={Link}
                to="/add-offering"
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
              id="document"
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
