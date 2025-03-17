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
  Radio,
  Select,
  TextInput,
  Title,
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
      brand_type: "",
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
    distributorsData?.data?.map((dist) => ({
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

  return (
    <div className="bg-white w-full rounded-[20px] p-6 mt-5">
      <Title order={2} className="text-primary font-semibold text-xl">
        Refine your results
      </Title>
      <div className="flex items-center gap-x-5 mt-6">
        <TextInput
          {...form.getInputProps("search")}
          aria-label="Search"
          placeholder="Search for..."
          className="flex-grow"
          leftSection={<SearchIcon />}
        />
        <div
          className={twMerge(
            "flex items-center gap-x-2 cursor-pointer",
            !form.getValues().search.length && "invisible"
          )}
          onClick={() => form.reset()}
        >
          <CloseButton />
          <span className="hidden sm:inline text-nowrap text-primary font-medium">
            Clear all
          </span>
        </div>
      </div>
      <Divider className="my-4 sm:my-6 border-primary border-opacity-50" />
      <Group w="100% gap-4 sm:gap-5">
        {isProductsPage ? (
          <>
            <Select
              {...form.getInputProps("brand_id")}
              aria-label="Filter by brand"
              placeholder="Filter by brand"
              data={brandOptions}
              clearable
              className="grow"
              rightSection={<ChevronDownIcon />}
            />
            <Select
              {...form.getInputProps("sub_brand_id")}
              aria-label="Filter by brand pillar"
              placeholder="Filter by brand pillar"
              data={brandPillarOptions}
              clearable
              className="grow"
              rightSection={<ChevronDownIcon />}
            />
            <Select
              {...form.getInputProps("distributor_id")}
              aria-label="Filter by distributor"
              placeholder="Filter by distributor"
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
          <Radio.Group name="brand_type" {...form.getInputProps("brand_type")}>
            <Group
              gap={24}
              w="100%"
              className="mt-[10px] flex-col sm:flex-row  items-start "
            >
              <Radio
                value=""
                label="All"
                classNames={{
                  label: "text-primary text-sm pl-[5px] sm:pl-2",
                }}
              />
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
        </Group>
      )}
    </div>
  );
};

export default Filter;
