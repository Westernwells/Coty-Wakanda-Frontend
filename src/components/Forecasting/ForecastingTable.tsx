import {
    Checkbox,
    Group,
    Loader,
    Select,
    Table,
    Tabs,
    Title,
} from "@mantine/core";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { useEffect, useMemo, useState } from "react";
import { useField } from "@mantine/form";
import EyeIcon from "../Icons/EyeIcon";
import { useNavigate } from "@tanstack/react-router";
import { getForecasts } from "@/api/forecasts/get-forcasts";
import { useQuery } from "@tanstack/react-query";
import { addMonthsToDate, dateToLocalString } from "@/lib/utils";
import get from "lodash.get";
import ErrorCard from "../Shared/ErrorCard";
import { useInView } from "react-intersection-observer";

function ForecastingTable({
    filters,
}: {
    filters: {
        search: string;
        brand: string;
        pillar: string;
        distributor: string;
        launchId: string;
    };
}) {
    const [activePage, setActivePage] = useState(1);
    const [sortBy, setSortBy] = useState<string | null>("");
    const itemsPerPage = 10;
    const [activeTab, setActiveTab] = useState<string | null>("Innovation");
    const [date, setDate] = useState<Date>(new Date());
    const navigate = useNavigate();
    const { ref, inView } = useInView({
        threshold: 1,
        delay: 100,
        trackVisibility: true,
    });

    const { data, isLoading, isError } = useQuery({
        queryKey: ["base-forcasts"],
        queryFn: getForecasts,
    });

    const baseForecastData = data?.data.forecast;

    const forecastTypeField = useField<string>({
        initialValue: "",
    });

    const handleForecastTypeChange = (
        value: "all" | "saleable" | "nonSaleable"
    ) => {
        forecastTypeField.setValue(value);
    };

    const sortOptions = [
        { value: "product.brand.name", label: "Brand" },
        { value: "product.offering_number", label: "Offering Number" },
        { value: "cost", label: "Cost" },
    ];

    // Filter data based on search and filters
    const filteredData = useMemo(() => {
        if (!baseForecastData) return [];

        return baseForecastData.filter((item) => {
            const searchTerm = filters.search.toLowerCase();
            const searchMatch =
                !filters.search ||
                item.product.brand.name.toLowerCase().includes(searchTerm) ||
                item.distributor?.name.toLowerCase().includes(searchTerm) ||
                item.product.offering_number.toLowerCase().includes(searchTerm);

            const filterMatch =
                (!filters.brand || item.product.brand.name === filters.brand) &&
                (!filters.pillar ||
                    item.product.brand.name === filters.pillar) &&
                (!filters.distributor ||
                    item.distributor?.name === filters.distributor) &&
                (!filters.launchId ||
                    item.product.offering_number === filters.launchId);

            return searchMatch && filterMatch;
        });
    }, [filters, baseForecastData]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Load more data dynamically
    const paginatedData = useMemo(() => {
        return filteredData.slice(0, activePage * itemsPerPage);
    }, [filteredData, activePage]);

    // Detect when the user reaches the bottom and load more
    useEffect(() => {
        if (inView && activePage < totalPages) {
            setActivePage((prev) => prev + 1);
        }
    }, [inView, activePage, totalPages]);

    useEffect(() => {
        if (baseForecastData) {
            const newDate = new Date(
                `1 ${Object.keys(baseForecastData[0].items)[0]}`
            );
            setDate(newDate);
        }
    }, [baseForecastData]);

    if (isError) {
        return <ErrorCard />;
    }

    if (!baseForecastData || isLoading) {
        return (
            <div className="bg-white shadow-md text-center rounded-lg p-6 mt-5">
                <Loader />
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-5">
            {/* Table */}
            <Group justify="space-between" className="mb-4">
                <Tabs
                    color="#002554"
                    className="text-primary hidden sm:block"
                    defaultValue="Innovation"
                    value={activeTab}
                    onChange={setActiveTab}
                >
                    <Tabs.List className="before:border-0">
                        <Tabs.Tab value="Innovation" className="grow">
                            Innovation forecast
                        </Tabs.Tab>
                        <Tabs.Tab value="Base" className="grow">
                            Base forecast
                        </Tabs.Tab>
                    </Tabs.List>
                </Tabs>

                <Group className="grow">
                    <Select
                        aria-label="Sort by"
                        placeholder="Sort by"
                        data={sortOptions}
                        value={sortBy}
                        onChange={(v) => setSortBy(v)}
                        clearable
                        className="grow"
                        rightSection={<ChevronDownIcon />}
                    />
                </Group>
            </Group>

            <Group className="mb-4">
                <Title order={2} className="text-primary font-semibold text-xl">
                    {activeTab} Forecast
                </Title>
                <Group>
                    <Checkbox
                        label="All"
                        size="xs"
                        checked={
                            forecastTypeField.getInputProps().value === "all"
                        }
                        onChange={() => handleForecastTypeChange("all")}
                    />
                    <Checkbox
                        label="Saleable"
                        size="xs"
                        checked={
                            forecastTypeField.getInputProps().value ===
                            "saleable"
                        }
                        onChange={() => handleForecastTypeChange("saleable")}
                    />
                    <Checkbox
                        label="Non-Saleable"
                        size="xs"
                        checked={
                            forecastTypeField.getInputProps().value ===
                            "nonSaleable"
                        }
                        onChange={() => handleForecastTypeChange("nonSaleable")}
                    />
                </Group>
            </Group>

            <div className="relative border border-primary rounded-xl border-t-0">
                <Table.ScrollContainer minWidth={768}>
                    <Table
                        verticalSpacing="sm"
                        borderColor="transparent"
                        striped="even"
                        stripedColor="#F2F4F6"
                    >
                        <Table.Thead>
                            <Table.Tr className="bg-primary text-white">
                                <Table.Th className="rounded-ss-xl">
                                    Brand
                                </Table.Th>
                                <Table.Th>Brand pillar</Table.Th>
                                <Table.Th>SKU</Table.Th>
                                <Table.Th>Launch ID</Table.Th>
                                <Table.Th>Distributor</Table.Th>
                                <Table.Th>Offering Number</Table.Th>
                                {Object.keys(paginatedData[0]?.items || {}).map(
                                    (key) => (
                                        <Table.Th key={key}>
                                            {dateToLocalString(
                                                addMonthsToDate(
                                                    date,
                                                    parseInt(key)
                                                )
                                            )}
                                        </Table.Th>
                                    )
                                )}
                                <Table.Th className="rounded-se-xl"></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {paginatedData.map((element, index) => (
                                <Table.Tr
                                    key={element.product.id}
                                    ref={
                                        index === paginatedData.length - 1
                                            ? ref
                                            : null
                                    }
                                >
                                    <Table.Td>
                                        {element.product.brand.name}
                                    </Table.Td>
                                    <Table.Td>
                                        {element.product.brand.name}
                                    </Table.Td>
                                    <Table.Td>
                                        {element.product.offering_number}
                                    </Table.Td>
                                    <Table.Td>
                                        {element.product.offering_number}
                                    </Table.Td>
                                    <Table.Td>
                                        {element.distributor?.name}
                                    </Table.Td>
                                    <Table.Td>
                                        {element.product.offering_number}
                                    </Table.Td>
                                    {Object.keys(element.items).map((key) => (
                                        <Table.Td key={key}>
                                            {element.items[key].value}
                                        </Table.Td>
                                    ))}
                                    <Table.Td
                                        className="cursor-pointer"
                                        onClick={() =>
                                            navigate({
                                                to: `/forecast-details/$productId`,
                                                params: {
                                                    productId:
                                                        element.product.id.toString(),
                                                },
                                            })
                                        }
                                    >
                                        <EyeIcon />
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            </div>
        </div>
    );
}

export default ForecastingTable;
