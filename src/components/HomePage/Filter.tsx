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
import SearchIcon from "../Icons/SearchIcon";
import { twMerge } from "tailwind-merge";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { useQueries } from "@tanstack/react-query";
import { getMarkets } from "@/api/get-markets";
import { getRegions } from "@/api/get-regions";
import { getBrands } from "@/api/get-brands";
import { getBrandPillars } from "@/api/get-brandPillars";
import { getDistributors } from "@/api/distributors/get-distributors";
import { Filters } from "@/types";

const Filter = ({
  setFilters,
  isProductsPage = false,
}: {
  setFilters: React.Dispatch<
    React.SetStateAction<Filters>
  >;
  isProductsPage?: boolean;
}) => {
  const [
    { data: marketsData, error: marketsError },
    { data: regionsData, error: regionsError },
    { data: brandsData, error: brandsError },
    { data: brandPillarsData, error: brandPillarsError },
    { data: distributorsData, error: distributorsError },
  ] = useQueries({
    queries: [
      { queryKey: ["markets"], queryFn: getMarkets },
      { queryKey: ["regions"], queryFn: getRegions },
      { queryKey: ["brands"], queryFn: getBrands },
      { queryKey: ["brandPillars"], queryFn: getBrandPillars },
      {
        queryKey: ["distributors"],
        queryFn: () => getDistributors({ page: 1, per_page: 9999999999 }),
      },
    ],
  });
  // const isDistributor = useUserStore((state) => state.user?.role === "admin");
  // Transform data for select components
  const marketOptions =
    marketsData?.data?.map((market) => ({
      value: market.name,
      label: market.name,
    })) || [];

  const regionOptions =
    regionsData?.data?.map((region) => ({
      value: region.name,
      label: region.name,
    })) || [];

  const brandOptions =
    brandsData?.data?.map((brand) => ({
      value: brand.name,
      label: brand.name,
    })) || [];
  const brandPillarOptions =
    brandPillarsData?.data?.map((pillar) => ({
      value: pillar.name,
      label: pillar.name,
    })) || [];
  const distributorOptions =
    distributorsData?.data?.map((dist) => ({
      value: dist.name,
      label: dist.name,
    })) || [];
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      search: "",
      region: "",
      market: "",
      brand: "",
      brandPillar: "",
      distributor: "",
      productType: "",
    },

    onValuesChange: (values) => {
      setFilters(values);
    },
  });

  const hasError = marketsError || regionsError || brandsError || brandPillarsError || distributorsError;

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
              data={distributorOptions}
              clearable
              className="grow"
              rightSection={<ChevronDownIcon />}
            />
          </>
        ) : (
          <>
            <Select
              {...form.getInputProps("region")}
              aria-label="Filter by region"
              placeholder="Filter by region"
              data={regionOptions}
              clearable
              className="grow"
              rightSection={<ChevronDownIcon />}
            />
            <Select
              {...form.getInputProps("market")}
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
          <Radio.Group
            name="productType"
            {...form.getInputProps("productType")}
          >
            <Group
              gap={24}
              w="100%"
              className="mt-[10px] flex-col sm:flex-row  items-start "
            >
              <Radio
                value="all"
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
