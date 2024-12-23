import { Button, Grid, Group, MultiSelect, TextInput } from "@mantine/core";
import { FormSection } from "../Shared/Form/Section";
import { selectStyles, textInputStyles } from "../Shared/Styles";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { useQueries } from "@tanstack/react-query";
import { getMarkets } from "@/api/get-markets";
import { getRegions } from "@/api/get-regions";
import { getCategories } from "@/api/get-categories";
import { getBrands } from "@/api/get-brands";
import { getBrandPillars } from "@/api/get-brandPillars";
import { useForm } from "@mantine/form";
import ExitIcon from "../Icons/ExitIcon";
import RefreshIcon from "../Icons/RefreshIcon";

const DistributorSettings = () => {
  const [
    { data: marketsData },
    { data: regionsData },
    { data: categoriesData },
    { data: brandsData },
    { data: brandPillarsData },
  ] = useQueries({
    queries: [
      { queryKey: ["markets"], queryFn: getMarkets },
      { queryKey: ["regions"], queryFn: getRegions },
      { queryKey: ["categories"], queryFn: getCategories },
      { queryKey: ["brands"], queryFn: getBrands },
      { queryKey: ["brandPillars"], queryFn: getBrandPillars },
    ],
  });

  const form = useForm({
    initialValues: {
      type: "formal",
      name: "",
      regions: [],
      markets: [],
      company_registration_number: "",
      contact_person: "",
      contact_email: "",
      categories: [],
      brands: [],
      brand_pillars: [],
      currency: "",
      coefficients: [],
    },
  });

  return (
    <form>
      <FormSection title="System settings" className="mt-2 sm:mt-5">
        <Grid gutter={24}>
          <Grid.Col span={{ sm: 6, base: 12 }}>
            <TextInput
              {...form.getInputProps("name")}
              label="Bussiness Name"
              placeholder="Bussiness Name"
              classNames={selectStyles}
            />
          </Grid.Col>
          <Grid.Col span={{ sm: 6, base: 12 }}>
            <MultiSelect
              {...form.getInputProps("regions")}
              label="Regions"
              placeholder="Select regions"
              data={
                regionsData?.data?.map((region) => ({
                  value: region.id.toString(),
                  label: region.name,
                })) || []
              }
              rightSection={<ChevronDownIcon />}
              classNames={textInputStyles}
              clearable
              autoComplete="off"
              searchable
            />
          </Grid.Col>
          <Grid.Col span={{ sm: 6, base: 12 }}>
            <MultiSelect
              {...form.getInputProps("markets")}
              label="Markets/Countries"
              placeholder="Select markets/countries"
              value={form.values.markets}
              data={
                marketsData?.data?.map((market) => ({
                  value: market.id.toString(),
                  label: market.name,
                })) || []
              }
              rightSection={<ChevronDownIcon />}
              classNames={selectStyles}
              clearable
              searchable
              autoComplete="off"
            />
          </Grid.Col>
          <Grid.Col span={{ sm: 6, base: 12 }}>
            <TextInput
              {...form.getInputProps("company_registration_number")}
              label="Company registration number"
              placeholder="Company registration number"
              classNames={selectStyles}
            />
          </Grid.Col>
          <Grid.Col span={{ sm: 6, base: 12 }}>
            <TextInput
              {...form.getInputProps("contact_person")}
              label="Contact person"
              placeholder="Contact person"
              classNames={selectStyles}
            />
          </Grid.Col>
          <Grid.Col span={{ sm: 6, base: 12 }}>
            <TextInput
              {...form.getInputProps("contact_email")}
              label="Contact email"
              placeholder="Contact email"
              classNames={selectStyles}
            />
          </Grid.Col>
          <Grid.Col span={{ sm: 6, base: 12 }}>
            <MultiSelect
              {...form.getInputProps("categories")}
              label="Categories"
              placeholder="Select categories"
              value={form.values.categories}
              data={
                categoriesData?.data?.map((category) => ({
                  value: category.id.toString(),
                  label: category.name,
                })) || []
              }
              rightSection={<ChevronDownIcon />}
              classNames={selectStyles}
              clearable
              searchable
            />
          </Grid.Col>
          <Grid.Col span={{ sm: 6, base: 12 }}>
            <MultiSelect
              {...form.getInputProps("brands")}
              label="Marketed COTY brands"
              value={form.values.brands}
              placeholder="Select brands"
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
          <Grid.Col span={{ sm: 6, base: 12 }}>
            <MultiSelect
              {...form.getInputProps("brand_pillars")}
              label="Brand pillars"
              placeholder="Select brand pillars"
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
        </Grid>
      </FormSection>
      <Group justify="end" mt="md">
        <Button
          variant="outline"
          className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
          leftSection={<ExitIcon />}
        >
          Cancel
        </Button>
        <Button
          leftSection={<RefreshIcon />}
          type="submit"
          variant="outline"
          className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
          onClick={() => {
            console.log("hello");
          }}
        >
          Update
        </Button>
      </Group>
    </form>
  );
};

export default DistributorSettings;
