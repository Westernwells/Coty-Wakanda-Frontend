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
import { useEffect, useState } from "react";
import { useField } from "@mantine/form";
import EyeIcon from "../Icons/EyeIcon";
import { useNavigate } from "@tanstack/react-router";
import { ForecastData, ForecastFilters, Meta } from "@/types";
import { getForecasts } from "@/api/forecasts/get-forcasts";
import InfiniteScroll from "react-infinite-scroll-component";

function ForecastingTable({
    filters,
    initialData,
    initialMeta,
}: {
    initialData: ForecastData[];
    initialMeta: Meta;
    filters: ForecastFilters;
}) {
    const [sortBy, setSortBy] = useState<string | null>(""); // ✅ Sorting state
    const [activeTab, setActiveTab] = useState<string | null>("Innovation");
    const navigate = useNavigate();
    const [forecasts, setForecasts] = useState<ForecastData[]>(initialData);
    const [meta, setMeta] = useState<Meta>(initialMeta);
    const [hasMore, setHasMore] = useState(initialMeta.has_next);
    const forecastTypeField = useField<string>({ initialValue: "" });

    // ✅ Reset forecasts & fetch new data when filters, sorting, or forecast type changes
    useEffect(() => {
        fetchNewForecasts();
    }, [filters, sortBy, forecastTypeField.getValue()]);

    const fetchNewForecasts = async () => {
        try {
            const response = await getForecasts({
                cursor: 1, // ✅ Always start from the first page
                page_size: 20,
                filter: {
                    ...filters,
                    sort: sortBy as string,
                    type: forecastTypeField.getValue(),
                },
            });

            setForecasts(response.data.forecast);
            setMeta(response.meta);
            setHasMore(response.meta.has_next);
        } catch (error) {
            console.error("Error fetching new forecasts:", error);
            setHasMore(false);
        }
    };

    const fetchMoreForecasts = async () => {
        if (!meta?.has_next) return;

        try {
            const response = await getForecasts({
                cursor: meta.cursor,
                page_size: 20,
                filter: {
                    ...filters,
                    sort: sortBy as string,
                    type: forecastTypeField.getValue(),
                },
            });

            setForecasts((prev) => [...prev, ...response.data.forecast]);
            setMeta(response.meta);
            setHasMore(response.meta.has_next);
        } catch (error) {
            console.error("Error fetching more forecasts:", error);
            setHasMore(false);
        }
    };

    const handleForecastTypeChange = (
        value: "all" | "saleable" | "nonSaleable"
    ) => {
        forecastTypeField.setValue(value);
    };

    const sortOptions = [
        { value: "brand", label: "Brand" },
        { value: "offering_number", label: "Offering Number" },
        { value: "cost", label: "Cost" },
    ];

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
                        onChange={(v) => setSortBy(v)} // ✅ Trigger sorting
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
                <InfiniteScroll
                    dataLength={forecasts.length}
                    next={fetchMoreForecasts}
                    hasMore={hasMore}
                    loader={
                        <div className="text-center py-4">
                            <Loader size="md" />
                        </div>
                    }
                    endMessage={
                        <p className="text-center text-gray-500 py-4">
                            No more forecasts to load.
                        </p>
                    }
                >
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
                                    {Object.keys(forecasts[0].items).map(
                                        (key) => (
                                            <Table.Th key={key}>{key}</Table.Th>
                                        )
                                    )}
                                    <Table.Th className="rounded-se-xl"></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {forecasts.map((element) => (
                                    <Table.Tr key={element.product.id}>
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
                                        {Object.keys(element.items).map(
                                            (key) => (
                                                <Table.Td key={key}>
                                                    {element.items[key].value}
                                                </Table.Td>
                                            )
                                        )}
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
                </InfiniteScroll>
            </div>
        </div>
    );
}

export default ForecastingTable;
