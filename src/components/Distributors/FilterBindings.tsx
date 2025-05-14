import { getBrandPillars } from "@/api/get-brandPillars";
import { getBrands } from "@/api/get-brands";
import { BindingFilters } from "@/types";
import { Grid, Group, Radio, Select, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useQueries } from "@tanstack/react-query";
import ChevronDownIcon from "../Icons/ChevronDownIcon";

const FilterBindings = ({
  setFilters,
}: {
  setFilters: React.Dispatch<React.SetStateAction<BindingFilters>>;
}) => {
  const form = useForm({
    initialValues: {
      brand_id: "",
      sub_brand_id: "",
      brand_type: "",
      pref: "",
      grouping: "",
      product_type: "",
    },

    onValuesChange: (values) => {
      setFilters(values);
    },
  });

  const [
    { data: brandsData, error: brandsError },
    { data: brandPillarsData, error: brandPillarsError },
  ] = useQueries({
    queries: [
      { queryKey: ["brands"], queryFn: () => getBrands() },
      {
        queryKey: ["brandPillars", form.getValues().brand_id],
        queryFn: () =>
          getBrandPillars({ filter: { brand_id: form.getValues().brand_id } }),
        enabled: !!form.getValues().brand_id,
      },
    ],
  });

  const brandOptions =
    brandsData?.data?.map((brand) => ({
      value: brand.id.toString(),
      label: brand.name,
    })) || [];
  const brandPillarOptions =
    brandPillarsData?.data?.map((pillar) => ({
      value: pillar.id.toString(),
      label: pillar.name,
    })) || [];

  const hasError = brandsError || brandPillarsError;

  if (hasError) {
    return (
      <div className="bg-white w-full mt-5">
        <div className="text-red-500">
          Error loading filter data. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full rounded-[20px] ">
      <Title order={2} className="text-primary font-semibold text-xl">
        Product Filter
      </Title>
      <Grid w="100% gap-4 sm:gap-5">
        <Grid.Col
          span={{
            md: 6,
            base: 12,
          }}
        >
          <Select
            {...form.getInputProps("brand_id")}
            aria-label="Filter by brand"
            placeholder="Filter by brand"
            data={brandOptions}
            clearable
            className="grow"
            rightSection={<ChevronDownIcon />}
          />
        </Grid.Col>
        <Grid.Col
          span={{
            md: 6,
            base: 12,
          }}
        >
          <Select
            {...form.getInputProps("sub_brand_id")}
            aria-label="Filter by brand pillar"
            placeholder="Filter by brand pillar"
            data={brandPillarOptions}
            clearable
            className="grow"
            rightSection={<ChevronDownIcon />}
          />
        </Grid.Col>
      </Grid>

      <Grid justify="space-between" w="100%" className="mt-6">
        <Grid.Col
          span={{
            md: 6,
            base: 12,
          }}
        >
          <Radio.Group label="Pref" name="pref" {...form.getInputProps("pref")}>
            <Group
              gap={24}
              w="100%"
              className="mt-[10px] flex-col sm:flex-row  items-start "
            >
              <Radio
                value="pref"
                label="Pref"
                classNames={{
                  label: "text-primary text-sm pl-[5px] sm:pl-2",
                }}
              />
              <Radio
                value="non-pref"
                label="Non-Pref"
                classNames={{
                  label: "text-primary text-sm pl-[5px] sm:pl-2",
                }}
              />
            </Group>
          </Radio.Group>
        </Grid.Col>
        <Grid.Col
          span={{
            md: 6,
            base: 12,
          }}
        >
          <Radio.Group
            label="Brand Type"
            name="brand_type"
            {...form.getInputProps("brand_type")}
          >
            <Group
              gap={24}
              w="100%"
              className="mt-[10px] flex-col sm:flex-row  items-start "
            >
              <Radio
                value="mass"
                label="Mass"
                classNames={{
                  label: "text-primary text-sm pl-[5px] sm:pl-2",
                }}
              />
              <Radio
                value="luxury"
                label="Luxury"
                classNames={{
                  label: "text-primary text-sm pl-[5px] sm:pl-2",
                }}
              />
            </Group>
          </Radio.Group>
        </Grid.Col>
        <Grid.Col
          span={{
            md: 6,
            base: 12,
          }}
        >
          <Radio.Group
            label="Grouping"
            name="grouping"
            {...form.getInputProps("grouping")}
          >
            <Group
              gap={24}
              w="100%"
              className="mt-[10px] flex-col sm:flex-row  items-start "
            >
              <Radio
                value="1"
                label="Group 1"
                classNames={{
                  label: "text-primary text-sm pl-[5px] sm:pl-2",
                }}
              />
              <Radio
                value="2"
                label="Group 2"
                classNames={{
                  label: "text-primary text-sm pl-[5px] sm:pl-2",
                }}
              />
              <Radio
                value="3"
                label="Group 3"
                classNames={{
                  label: "text-primary text-sm pl-[5px] sm:pl-2",
                }}
              />
            </Group>
          </Radio.Group>
        </Grid.Col>
        <Grid.Col
          span={{
            md: 6,
            base: 12,
          }}
        >
          <Radio.Group
            label="Product Type"
            name="product_type"
            {...form.getInputProps("product_type")}
          >
            <Group
              gap={24}
              w="100%"
              className="mt-[10px] flex-col sm:flex-row  items-start "
            >
              <Radio
                value="non-saleable"
                label="Non-saleable"
                classNames={{
                  label: "text-primary text-sm pl-[5px] sm:pl-2",
                }}
              />
              <Radio
                value="saleable"
                label="saleable"
                classNames={{
                  label: "text-primary text-sm pl-[5px] sm:pl-2",
                }}
              />
            </Group>
          </Radio.Group>
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default FilterBindings;
