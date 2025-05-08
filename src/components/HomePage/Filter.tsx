import { getDistributors } from "@/api/distributors/get-distributors";
import { getBrandPillars } from "@/api/get-brandPillars";
import { getBrands } from "@/api/get-brands";
import { getRegions } from "@/api/get-regions";
import { getMarkets } from "@/api/listManagement/markets/get-markets";
import { Filters } from "@/types";
import {
  CloseButton,
  Divider,
  Group,
  Select,
  TextInput,
  Title,
  Checkbox,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useQueries } from "@tanstack/react-query";
import { twMerge } from "tailwind-merge";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import SearchIcon from "../Icons/SearchIcon";

const Filter = ({
  setFilters,
  isProductsPage = false,
}: {
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  isProductsPage?: boolean;
}) => {
  // const isDistributor = useUserStore((state) => state.user?.role === "admin");
  // Transform data for select components
  const form = useForm({
    initialValues: {
      search: "",
      region_id: "",
      market_id: "",
      brand_id: "",
      sub_brand_id: "",
      distributor_id: "",
      division: "",
      brand_type: "all",
    },

    onValuesChange: (values) => {
      setFilters(values);
    },
  });

  const [
    { data: marketsData, error: marketsError },
    { data: regionsData, error: regionsError },
    { data: brandsData, error: brandsError },
    { data: brandPillarsData, error: brandPillarsError },
    { data: distributorsData, error: distributorsError },
  ] = useQueries({
    queries: [
      {
        queryKey: ["markets"],
        queryFn: () => getMarkets({ page_size: 99999 }),
      },
      { queryKey: ["regions"], queryFn: getRegions },
      { queryKey: ["brands"], queryFn: getBrands },
      { queryKey: ["brandPillars"], queryFn: () => getBrandPillars() },
      {
        queryKey: ["distributors"],
        queryFn: () => getDistributors({ page_size: 100 }),
      },
    ],
  });

  const marketOptions =
    marketsData?.data?.map((market) => ({
      value: market.id.toString(),
      label: market.name,
    })) || [];

  const regionOptions =
    regionsData?.data?.map((region) => ({
      value: region.id.toString(),
      label: region.name,
    })) || [];

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
  const distributorOptions =
    distributorsData?.data?.map((dist: { id: number; name: string }) => ({
      value: dist.id.toString(),
      label: dist.name,
    })) || [];

  const hasError =
    marketsError ||
    regionsError ||
    brandsError ||
    brandPillarsError ||
    distributorsError;

  if (hasError) {
    return (
      <div className="bg-white w-full rounded-[20px] p-6 mt-5">
        <div className="text-red-500">
          Error loading filter data. Please try again later.
        </div>
      </div>
    );
  }

  // Checkbox logic: only one can be checked at a time, but styled as checkboxes
  function handleBrandTypeChange(type: string) {
    form.setFieldValue("brand_type", type);
    setFilters({ ...form.values, brand_type: type });
  }

  return (
    <div className="bg-[#F5F8FA] w-full rounded-[20px] p-6 mt-5">
      <Group justify="space-between" align="center">
        <Title order={2} className="text-primary font-semibold text-xl">
          Refine your results
        </Title>
      </Group>

      <div className="flex items-center gap-x-5 mt-6">
        <TextInput
          {...form.getInputProps("search")}
          aria-label="Search"
          placeholder="Search for..."
          className="flex-grow"
          leftSection={<SearchIcon />}
        />
        <button
          type="button"
          className={twMerge("flex items-center gap-x-2 cursor-pointer group")}
          onClick={() => {
            setFilters({
              search: "",
              region_id: "",
              market_id: "",
              brand_id: "",
              sub_brand_id: "",
              distributor_id: "",
              division: "",
              brand_type: "all",
            });
            form.reset();
          }}
        >
          <CloseButton className="group-hover:text-[#00EBB2] transition-all ease-in-out duration-300" />
          <span className="hidden sm:inline text-nowrap text-primary font-medium group-hover:text-[#00EBB2] transition-all ease-in-out duration-300">
            Clear all
          </span>
        </button>
      </div>
      <Divider className="my-4 sm:my-6 border-primary border-opacity-50" />
      <Group w="100% gap-4 sm:gap-5">
        {isProductsPage ? (
          <>
            <Select
              {...form.getInputProps("brand_id")}
              aria-label="Filter brands"
              placeholder="Filter brands"
              data={brandOptions}
              clearable
              className="grow "
              rightSection={<ChevronDownIcon />}
            />
            <Select
              {...form.getInputProps("sub_brand_id")}
              aria-label="Filter brand pillars"
              placeholder="Filter brand pillars"
              data={brandPillarOptions}
              clearable
              className="grow"
              rightSection={<ChevronDownIcon />}
            />
            <Select
              {...form.getInputProps("distributor_id")}
              aria-label="Filter distributors"
              placeholder="Filter distributors"
              data={distributorOptions}
              clearable
              className="grow"
              rightSection={<ChevronDownIcon />}
            />
          </>
        ) : (
          <>
            <Select
              {...form.getInputProps("region_id")}
              aria-label="Filter by region"
              placeholder="Filter by region"
              data={regionOptions}
              clearable
              className="grow"
              rightSection={<ChevronDownIcon />}
            />
            <Select
              {...form.getInputProps("market_id")}
              aria-label="Filter by market"
              placeholder="Filter by market"
              data={marketOptions}
              clearable
              className="grow"
              rightSection={<ChevronDownIcon />}
            />
          </>
        )}
      </Group>
      {isProductsPage && (
        <Group gap={24} w="100%" className="mt-6">
          <div className="flex items-center gap-6 mt-4">
            <Checkbox
              checked={form.values.brand_type === "all"}
              onChange={() => handleBrandTypeChange("all")}
              label={<span className="text-primary text-sm">All</span>}
              className="min-w-[80px] "
              classNames={{
                input: "cursor-pointer",
              }}
            />
            <Checkbox
              checked={form.values.brand_type === "luxury"}
              onChange={() => handleBrandTypeChange("luxury")}
              label={<span className="text-primary text-sm">Luxury only</span>}
              className="min-w-[120px] "
              classNames={{
                input: "cursor-pointer",
              }}
            />
            <Checkbox
              checked={form.values.brand_type === "mass"}
              onChange={() => handleBrandTypeChange("mass")}
              label={<span className="text-primary text-sm">Mass only</span>}
              className="min-w-[120px] "
              classNames={{
                input: "cursor-pointer",
              }}
            />
          </div>
        </Group>
      )}
    </div>
  );
};

export default Filter;
