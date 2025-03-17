import { getDistributors } from "@/api/distributors/get-distributors";
import { getBrandPillars } from "@/api/get-brandPillars";
import { getBrands } from "@/api/get-brands";
import { ForecastFilters } from "@/types";
import {
    Button,
    CloseButton,
    Divider,
    Group,
    Radio,
    Select,
    TextInput,
    Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useQueries } from "@tanstack/react-query";
import { CSVLink } from "react-csv";
import { twMerge } from "tailwind-merge";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import DateIcon from "../Icons/DateIcon";
import FileDownloadIcon from "../Icons/FileDownloadIcon";
import SearchIcon from "../Icons/SearchIcon";

const ForecastingFilters = ({
    setFilters,
}: {
    setFilters: React.Dispatch<React.SetStateAction<ForecastFilters>>;
}) => {
    const form = useForm({
        initialValues: {
            search: "",
            start_date: "",
            end_date: "",
            launch_id: "",
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
        { data: brandsData, error: brandsError },
        { data: brandPillarsData, error: brandPillarsError },
        { data: distributorsData, error: distributorsError },
    ] = useQueries({
        queries: [
            { queryKey: ["brands"], queryFn: getBrands },
            { queryKey: ["brandPillars"], queryFn: () => getBrandPillars() },
            {
                queryKey: ["distributors"],
                queryFn: () => getDistributors({ page_size: 100 }),
            },
        ],
    });

    // Transform data for select components
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

    // Update parent filters when any field changes

    const hasError = brandsError || brandPillarsError || distributorsError;

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
            <div className="flex items-center gap-x-5 mt-6 flex-wrap">
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
                        !form.getValues().search.length && "hidden"
                    )}
                    onClick={() => form.reset()}
                >
                    <CloseButton />
                    <span className="hidden sm:inline text-nowrap text-primary font-medium">
                        Clear all
                    </span>
                </div>
                <CSVLink data={[]} className="w-full sm:w-auto">
                    <Button
                        variant="outline"
                        className="text-primary border-primary w-full mt-2 sm:mt-0 sm:w-auto"
                        leftSection={<FileDownloadIcon />}
                    >
                        Download CSV
                    </Button>
                </CSVLink>
            </div>
            <Divider className="my-4 sm:my-6 border-primary border-opacity-50" />
            <Group w="100% gap-4 sm:gap-5">
                <>
                    <DateInput
                        {...form.getInputProps("start_date")}
                        aria-label="Start Date"
                        placeholder="Start Date"
                        clearable
                        valueFormat="YYYY-MM-DD"
                        variant="filled"
                        className="grow"
                        rightSection={<DateIcon />}
                    />
                    <DateInput
                        {...form.getInputProps("end_date")}
                        aria-label="End Date"
                        placeholder="End Date"
                        valueFormat="YYYY-MM-DD"
                        clearable
                        variant="filled"
                        className="grow"
                        rightSection={<DateIcon />}
                    />
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
                    {/* <Select
            {...form.getInputProps("launchId")}
            aria-label="Filter by launch id"
            placeholder="Filter by launch id"
            data={brandOptions}
            clearable
            className="grow"
            rightSection={<ChevronDownIcon />}
          /> */}
                </>
            </Group>

            <Group gap={24} w="100%" className="mt-6">
                <Radio.Group
                    name="brandType"
                    {...form.getInputProps("brand_type")}
                >
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
        </div>
    );
};

export default ForecastingFilters;
