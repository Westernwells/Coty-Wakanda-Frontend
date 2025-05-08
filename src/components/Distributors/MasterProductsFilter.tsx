import { getDistributors } from "@/api/distributors/get-distributors";
import { getBrands } from "@/api/get-brands";
import type { MasterProductFilters } from "@/types";
import {
  Button,
  CloseButton,
  Divider,
  Group,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useQueries } from "@tanstack/react-query";
import { twMerge } from "tailwind-merge";
import SearchIcon from "../Icons/SearchIcon";
import ExitIcon from "../Icons/ExitIcon";
import { getHouses } from "@/api/get-houses";
import { CustomSelect } from "../HomePage/CustomSelect";

const MasterProductFilters = ({
  setFilters,
}: {
  setFilters: React.Dispatch<React.SetStateAction<MasterProductFilters>>;
}) => {
  // const isDistributor = useUserStore((state) => state.user?.role === "admin");
  // Transform data for select components
  const form = useForm({
    initialValues: {
      search: "",
      brand_id: "",
      distributor_id: "",
      house: "",
    },

    onValuesChange: (values) => {
      setFilters(values);
    },
  });

  const [
    { data: brandsData, error: brandsError },
    { data: distributorsData, error: distributorsError },
    { data: housesData, error: housesError },
  ] = useQueries({
    queries: [
      { queryKey: ["brands"], queryFn: getBrands },
      {
        queryKey: ["distributors"],
        queryFn: () => getDistributors({ page_size: 100 }),
      },
      {
        queryKey: ["houses"],
        queryFn: () => getHouses(),
      },
    ],
  });

  const brandOptions =
    brandsData?.data?.map((brand) => ({
      value: brand.id.toString(),
      label: brand.name,
    })) || [];

  const distributorOptions =
    distributorsData?.data?.map((dist) => ({
      value: dist.id.toString(),
      label: dist.name,
    })) || [];

  const hasError = brandsError || distributorsError || housesError;
  const houseOptions =
    housesData?.data?.map((house) => ({
      value: house,
      label: house,
    })) || [];

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
      <Group justify="space-between" align="center">
        <Title order={2} className="text-primary font-semibold text-xl">
          Refine your results
        </Title>

        <Button
          rightSection={<ExitIcon />}
          onClick={() => {
            setFilters({
              search: "",
              brand_id: "",
              distributor_id: "",
              house: "",
            });
            form.reset();
          }}
          variant="outline"
          className="border-primary  border-s-e rounded-ee-xl text-primary text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
        >
          Clear filters
        </Button>
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
          className={twMerge(
            "flex items-center gap-x-2 cursor-pointer group",
            !form.getValues().search.length && "invisible"
          )}
          onClick={() => {
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
        <div className="grid grid-cols-1 w-full sm:grid-cols-3 gap-4 sm:gap-5">
          {/* <Select
            {...form.getInputProps("brand_id")}
            aria-label="Filter by brand"
            placeholder="Filter by brand"
            data={brandOptions}
            clearable
            className="grow"
            rightSection={<ChevronDownIcon />}
          /> */}

          <CustomSelect
            value={form.values.brand_id}
            options={brandOptions}
            onChange={(val) => form.setFieldValue("brand_id", val)}
            placeholder="Filter by brand"
            className="min-w-max max-w-lg w-full"
            noBorder
          />

          <CustomSelect
            value={form.values.house}
            options={houseOptions}
            onChange={(val) => form.setFieldValue("house", val)}
            placeholder="Filter by house"
            className="min-w-max max-w-lg w-full"
            noBorder
          />

          <CustomSelect
            value={form.values.distributor_id}
            options={distributorOptions}
            onChange={(val) => form.setFieldValue("distributor_id", val)}
            placeholder="Filter by distributor"
            className="min-w-max max-w-lg w-full"
            noBorder
          />
        </div>
      </Group>
    </div>
  );
};

export default MasterProductFilters;
