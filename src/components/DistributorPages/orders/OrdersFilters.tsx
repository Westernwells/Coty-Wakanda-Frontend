import { Group, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import ChevronDownIcon from "../../Icons/ChevronDownIcon";
import { useEffect } from "react";
import { useQueries } from "@tanstack/react-query";
import { getBrands } from "@/api/get-brands";
import { getBrandPillars } from "@/api/get-brandPillars";
import { getDistributors } from "@/api/distributors/get-distributors";

const OrderFilter = ({
  setFilters,
}: {
  setFilters: React.Dispatch<
    React.SetStateAction<{
      brand: string;
      brandPillar: string;
      distributor: string;
      launchId: string;
    }>
  >;
}) => {
  const [
    { data: brandData, error: brandError },
    { data: brandPillarData, error: brandPillarError },
    { data: distributorsData, error: distributorsError },
  ] = useQueries({
    queries: [
      { queryKey: ["brands"], queryFn: getBrands },
      { queryKey: ["brandPillars"], queryFn: () => getBrandPillars() },
      {
        queryKey: ["distributors"],
        queryFn: () => getDistributors({ page_size: 999999 }),
      },
    ],
  });
  const brandOptions =
    brandData?.data?.map((brand) => ({
      value: brand.name,
      label: brand.name,
    })) || [];

  const brandPillarOptions =
    brandPillarData?.data?.map((brandPillar) => ({
      value: brandPillar.name,
      label: brandPillar.name,
    })) || [];

  const distributorsOptions =
    distributorsData?.data?.map((dist) => ({
      value: dist.name,
      label: dist.name,
    })) || [];

  const launchIdOptions =
    distributorsData?.data?.map((dist) => ({
      value: dist.name,
      label: dist.name,
    })) || [];

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      brand: "",
      brandPillar: "",
      distributor: "",
      launchId: "",
    },
  });

  // Update parent filters when any field changes
  useEffect(() => {
    setFilters(form.getValues());
  }, [setFilters, form]);

  const hasError = brandError || brandPillarError || distributorsError;

  if (hasError) {
    return (
      <div className="bg-white w-full rounded-[20px] p-6 mt-5">
        <div className="text-red-500">
          Error loading filter data. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <Group w="100% gap-4 sm:gap-5">
      <Select
        {...form.getInputProps("brand")}
        aria-label="Filter by brand"
        placeholder="Filter by brand"
        data={brandOptions}
        clearable
        className="grow"
        rightSection={<ChevronDownIcon />}
      />
      <Select
        {...form.getInputProps("brandPillar")}
        aria-label="Filter by brand pillar"
        placeholder="Filter by brand pillar"
        data={brandPillarOptions}
        clearable
        className="grow"
        rightSection={<ChevronDownIcon />}
      />
      <Select
        {...form.getInputProps("distributor")}
        aria-label="Filter by distributor"
        placeholder="Filter by distributor"
        data={distributorsOptions}
        clearable
        className="grow"
        rightSection={<ChevronDownIcon />}
      />
      <Select
        {...form.getInputProps("launchId")}
        aria-label="Filter by launch id"
        placeholder="Filter by launch id"
        data={launchIdOptions}
        clearable
        className="grow"
        rightSection={<ChevronDownIcon />}
      />
    </Group>
  );
};

export default OrderFilter;
