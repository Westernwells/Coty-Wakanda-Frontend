import {
    Button,
  Checkbox,
  CloseButton,
  Divider,
  Group,
  Select,
  TextInput,
  Title,
} from "@mantine/core";
import { useField } from "@mantine/form";
import SearchIcon from "../Icons/SearchIcon";
import { twMerge } from "tailwind-merge";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import DateIcon from "../Icons/DateIcon";
import { useEffect } from "react";
import { useQueries } from "@tanstack/react-query";
import { getBrands } from "@/api/get-brands";
import { getRegions } from "@/api/get-regions";
import { DateInput } from "@mantine/dates";
import { CSVLink } from "react-csv";
import FileDownloadIcon from "../Icons/FileDownloadIcon";

const ForecastingFilters = ({
  setFilters,
}: {
  setFilters: (filters: any) => void;
}) => {
  const [
    { data: brandsData, error: brandsError },
  ] = useQueries({
    queries: [
      { queryKey: ["brands"], queryFn: getBrands },
      { queryKey: ["regions"], queryFn: getRegions },
    ],
  });

  // Transform data for select components
  const brandOptions =
    brandsData?.data?.map((brand) => ({
      value: brand.name,
      label: brand.name,
    })) || [];

  // Initialize fields with proper typing
  const searchField = useField<string>({
    initialValue: "",
  });
  const startDateField = useField<Date | null>({
    initialValue: null,
  });
  const endDateField = useField<Date | null>({
    initialValue: null,
  });

  const regionField = useField<string>({
    initialValue: "",
  });

  const marketField = useField<string>({
    initialValue: "",
  });
  const brandField = useField<string>({
    initialValue: "",
  });
  const brandPillarField = useField<string>({
    initialValue: "",
  });
  const distributersField = useField<string>({
    initialValue: "",
  });
  const launchIdField = useField<string>({
    initialValue: "",
  });

  const productTypeField = useField<"all" | "luxury" | "mass">({
    initialValue: "all",
  });

  // Update parent filters when any field changes
  useEffect(() => {
    setFilters({
      search: searchField.getInputProps().value,
      region: regionField.getInputProps().value,
      market: marketField.getInputProps().value,
      brand: brandField.getInputProps().value,
      productType: productTypeField.getInputProps().value,
      pillar: brandPillarField.getInputProps().value,
      distributer: distributersField.getInputProps().value,
      launchId: launchIdField.getInputProps().value,
      startDate: startDateField.getInputProps().value,
      endDate: endDateField.getInputProps().value,
    });
  }, [
    searchField.getInputProps().value,
    regionField.getInputProps().value,
    marketField.getInputProps().value,
    brandField.getInputProps().value,
    brandPillarField.getInputProps().value,
    distributersField.getInputProps().value,
    launchIdField.getInputProps().value,
    productTypeField.getInputProps().value,
    startDateField.getInputProps().value,
    endDateField.getInputProps().value,
    setFilters,
  ]);

  const handleProductTypeChange = (value: "all" | "luxury" | "mass") => {
    productTypeField.setValue(value);
  };

  const hasError = brandsError;

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
          {...searchField.getInputProps()}
          aria-label="Search"
          placeholder="Search for..."
          className="w-full"
          leftSection={<SearchIcon />}
        />
        <CSVLink data={[]}>
        <Button variant="outline" className="text-primary border-primary" leftSection={<FileDownloadIcon />}>
          Download CSV
        </Button>
        </CSVLink>
        <div
          className={twMerge(
            "flex items-center gap-x-2 cursor-pointer",
            !searchField.getValue().length && "invisible"
          )}
          onClick={() => {
            searchField.setValue("");
            regionField.setValue("");
            marketField.setValue("");
            brandField.setValue("");
            productTypeField.setValue("all");
          }}
        >
          <CloseButton />
          <span className="hidden sm:inline text-nowrap text-primary font-medium">
            Clear all
          </span>
        </div>
      </div>
      <Divider className="my-4 sm:my-6 border-primary border-opacity-50" />
      <Group w="100% gap-4 sm:gap-5">
        <>
          <DateInput
            {...startDateField.getInputProps()}
            aria-label="Start Date"
            placeholder="Start Date"
            clearable
            variant="filled"
            className="grow"
            rightSection={<DateIcon />}
          />
          <DateInput
            {...endDateField.getInputProps()}
            aria-label="End Date"
            placeholder="End Date"
            clearable
            variant="filled"
            className="grow"
            rightSection={<DateIcon />}
          />
          <Select
            {...brandField.getInputProps()}
            aria-label="Filter by brand"
            placeholder="Filter by brand"
            data={brandOptions}
            clearable
            className="grow"
            rightSection={<ChevronDownIcon />}
          />
          <Select
            {...brandPillarField.getInputProps()}
            aria-label="Filter by brand pillar"
            placeholder="Filter by brand pillar"
            data={brandOptions}
            clearable
            className="grow"
            rightSection={<ChevronDownIcon />}
          />
          <Select
            {...distributersField.getInputProps()}
            aria-label="Filter by distributer"
            placeholder="Filter by distributer"
            data={brandOptions}
            clearable
            className="grow"
            rightSection={<ChevronDownIcon />}
          />
          <Select
            {...launchIdField.getInputProps()}
            aria-label="Filter by launch id"
            placeholder="Filter by launch id"
            data={brandOptions}
            clearable
            className="grow"
            rightSection={<ChevronDownIcon />}
          />
        </>
      </Group>

      <Group gap={24} w="100%" className="mt-6">
        <Checkbox
          label="All"
          size="xs"
          checked={productTypeField.getInputProps().value === "all"}
          onChange={() => handleProductTypeChange("all")}
        />
        <Checkbox
          label="Luxury only"
          size="xs"
          checked={productTypeField.getInputProps().value === "luxury"}
          onChange={() => handleProductTypeChange("luxury")}
        />
        <Checkbox
          label="Mass only"
          size="xs"
          checked={productTypeField.getInputProps().value === "mass"}
          onChange={() => handleProductTypeChange("mass")}
        />
      </Group>
    </div>
  );
};

export default ForecastingFilters;
