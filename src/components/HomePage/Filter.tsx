import {
    Checkbox,
    CloseButton,
    Divider,
    Group,
    Select,
    TextInput,
    Title,
} from "@mantine/core";

import ChevronDownIcon from "../Icons/ChevronDownIcon";
import SearchIcon from "../Icons/SearchIcon";
import { getMarkets } from "@/api/get-markets";
import { getRegions } from "@/api/get-regions";
import { twMerge } from "tailwind-merge";
import { useEffect } from "react";
import { useField } from "@mantine/form";
import { useQueries } from "@tanstack/react-query";

const Filter = ({
    setFilters,
    isProductsPage = false,
}: {
    setFilters: (filters: any) => void;
    isProductsPage?: boolean;
}) => {
    const [
        { data: marketsData, error: marketsError },
        { data: regionsData, error: regionsError },
    ] = useQueries({
        queries: [
            { queryKey: ["markets"], queryFn: getMarkets },
            { queryKey: ["regions"], queryFn: getRegions },
        ],
    });

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

    // Initialize fields with proper typing
    const searchField = useField<string>({
        initialValue: "",
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
            ...(isProductsPage && {
                productType: productTypeField.getInputProps().value,
            }),
        });
    }, [
        searchField.getInputProps().value,
        regionField.getInputProps().value,
        marketField.getInputProps().value,
        brandField.getInputProps().value,
        productTypeField.getInputProps().value,
        setFilters,
        isProductsPage,
    ]);

    const handleProductTypeChange = (value: "all" | "luxury" | "mass") => {
        productTypeField.setValue(value);
    };

    const hasError = marketsError || regionsError;

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
                        if (isProductsPage) {
                            productTypeField.setValue("all");
                        }
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
                    <Select
                        {...regionField.getInputProps()}
                        aria-label="Filter by region"
                        placeholder="Filter by region"
                        data={regionOptions}
                        clearable
                        className="grow"
                        rightSection={<ChevronDownIcon />}
                    />
                    <Select
                        {...marketField.getInputProps()}
                        aria-label="Filter by market"
                        placeholder="Filter by market"
                        data={marketOptions}
                        clearable
                        className="grow"
                        rightSection={<ChevronDownIcon />}
                    />
                </>
            </Group>

            {isProductsPage && (
                <Group gap={24} w="100%" className="mt-6">
                    <Checkbox
                        label="All"
                        size="xs"
                        checked={
                            productTypeField.getInputProps().value === "all"
                        }
                        onChange={() => handleProductTypeChange("all")}
                    />
                    <Checkbox
                        label="Luxury only"
                        size="xs"
                        checked={
                            productTypeField.getInputProps().value === "luxury"
                        }
                        onChange={() => handleProductTypeChange("luxury")}
                    />
                    <Checkbox
                        label="Mass only"
                        size="xs"
                        checked={
                            productTypeField.getInputProps().value === "mass"
                        }
                        onChange={() => handleProductTypeChange("mass")}
                    />
                </Group>
            )}
        </div>
    );
};

export default Filter;
