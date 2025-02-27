import { Group, Select, Table, Tabs } from "@mantine/core";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { useEffect, useMemo, useState } from "react";
import PencilIcon from "../Icons/PencilIcon";
import { useQuery } from "@tanstack/react-query";
import { getInnovations } from "@/api/innovations/get-innovations";
import ErrorCard from "../Shared/ErrorCard";
import { Loader } from "lucide-react";
import get from "lodash.get";
import { useInView } from "react-intersection-observer";

function InnovationsTable() {
    const [activePage, setActivePage] = useState(1);
    const [sortBy, setSortBy] = useState<string | null>("");
    const itemsPerPage = 10;
    const [activeTab, setActiveTab] = useState<string | null>("upcoming");

    const { data, isLoading, isError } = useQuery({
        queryKey: ["innovations"],
        queryFn: getInnovations,
    });

    const { ref, inView } = useInView({
        threshold: 1,
        delay: 100,
        trackVisibility: true,
    });

    const totalPages = Math.ceil((data?.data.length || 0) / itemsPerPage);

    const sortOptions = [
        { value: "brand", label: "Brand" },
        { value: "offeringNumber", label: "Offering number" },
        { value: "status", label: "Status" },
    ];

    // Filter data based on search and filters
    const filteredData = useMemo(() => {
        if (!data) return [];
        if (sortBy) {
            return [...data.data].sort((a, b) =>
                get(a, sortBy) > get(b, sortBy)
                    ? 1
                    : get(b, sortBy) > get(a, sortBy)
                      ? -1
                      : 0
            );
        }
        return data.data;
    }, [sortBy, data]);

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

    // Reset to first page when filters change
    useEffect(() => {
        setActivePage(1);
    }, [sortBy]);

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-5">
            {/* Table */}
            <Group justify="space-between" className="mb-4">
                <Tabs
                    color="#002554"
                    className="text-primary hidden sm:block"
                    defaultValue="upcoming"
                    value={activeTab}
                    onChange={setActiveTab}
                >
                    <Tabs.List className="before:border-0">
                        <Tabs.Tab
                            value="upcoming"
                            className="grow text-base font-medium"
                        >
                            Upcoming innovations
                        </Tabs.Tab>
                        <Tabs.Tab
                            value="archived"
                            className="grow text-base font-medium"
                        >
                            Archived innovations
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

            {isError ? (
                <ErrorCard errorText="An error occurred fetching data" />
            ) : isLoading || !data ? (
                <div className="bg-white shadow-md rounded-lg p-6 mt-5">
                    <div className="flex justify-center items-center mt-6">
                        <Loader />
                    </div>
                </div>
            ) : (
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
                                    <Table.Th>Offering Number</Table.Th>
                                    <Table.Th>Global ICW</Table.Th>
                                    <Table.Th>Global OCD</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th className="rounded-se-xl"></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {paginatedData.map((element, index) => (
                                    <Table.Tr
                                        key={element.launch_id}
                                        ref={
                                            index === paginatedData.length - 1
                                                ? ref
                                                : null
                                        }
                                    >
                                        <Table.Td className="first:rounded-es-xl">
                                            {element.brand.name}
                                        </Table.Td>
                                        <Table.Td>{element.launch_id}</Table.Td>
                                        <Table.Td>
                                            {element.launch_name}
                                        </Table.Td>
                                        <Table.Td>
                                            {element.launch_ref}
                                        </Table.Td>
                                        <Table.Td>
                                            {element.forecast_deadline}
                                        </Table.Td>
                                        <Table.Td
                                            className="last:rounded-ee-xl text-center !pr-2 cursor-pointer"
                                            onClick={() => {
                                                console.log(
                                                    "Navigating to edit..."
                                                );
                                            }}
                                        >
                                            <PencilIcon />
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </div>
            )}
        </div>
    );
}

export default InnovationsTable;
