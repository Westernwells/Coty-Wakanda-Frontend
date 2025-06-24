import { Group, Select, Table, Tabs } from "@mantine/core";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { useEffect, useMemo, useState } from "react";
import PencilIcon from "../Icons/PencilIcon";
import EyeIcon from "../Icons/EyeIcon";
import { useNavigate } from "@tanstack/react-router";
import Pagination from "./Pagination";
import { Loader } from "@mantine/core";
import { showOptions, sortOptions } from "@/constants/sort-options";
import { InnovationWithStatus } from "@/components/Distributor-forcasts/types/types";
import { useInnovationsWithOfferrings } from "./hooks/use-innovation-with-offerings";

function InnovationsForecastsTable() {
    const [activePage, setActivePage] = useState(1);
    const [sortBy, setSortBy] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [itemsPerPage, setItemsPerPage] = useState("5");
    const [activeTab, setActiveTab] = useState<string | null>("upcoming");
    
    const { innovationsData, isLoading, totalPages } = useInnovationsWithOfferrings(
        activePage, 
        Number(itemsPerPage), 
        activeTab
    );
    const navigate = useNavigate();

    const handleForecastClick = (row: InnovationWithStatus) => {
        const isActive = row.status === "active" || row.status === 'pre-active';
        if (isActive) {
            navigate({
                to: "/edit-innovation/$innovationId",
                params: { innovationId: row.id.toString() }
            });
        } else {
            navigate({
                to: "/innovation-forcasts-submit/$forecastId",
                params: { forecastId: row.id.toString() }
            });
        }
    }

    const handleSort = (value: string | null) => {
        if (value === sortBy) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(value);
            setSortDirection('asc');
        }
    };

    useEffect(() => {
        setActivePage(1);
    }, [itemsPerPage, activeTab]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <Loader size="md" />
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-5">
            <Group justify="space-between" className="mb-4">
                <Tabs
                    color="#002554"
                    className="text-primary hidden sm:block"
                    value={activeTab}
                    onChange={setActiveTab}
                >
                    <Tabs.List>
                        <Tabs.Tab value="upcoming" className="text-base font-medium">
                            Upcoming innovations
                        </Tabs.Tab>
                        <Tabs.Tab value="archived" className="text-base font-medium">
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
                        onChange={handleSort}
                        clearable
                        className="grow"
                        rightSection={<ChevronDownIcon />}
                    />
                    <Select
                        aria-label="Show items"
                        placeholder="Show items"
                        data={showOptions}
                        value={itemsPerPage}
                        onChange={(v) => v && setItemsPerPage(v)}
                        className="grow"
                        rightSection={<ChevronDownIcon />}
                    />
                </Group>
            </Group>
            <div className="relative border border-primary rounded-xl border-t-0">
                <Table.ScrollContainer minWidth={768}>
                    <Table verticalSpacing="sm" borderColor="transparent" striped="even" stripedColor="#F2F4F6">
                        <Table.Thead>
                            <Table.Tr className="bg-primary text-white">
                                <Table.Th className="rounded-ss-xl">Brand</Table.Th>
                                <Table.Th>Launch Name</Table.Th>
                                <Table.Th>Launch Id</Table.Th>
                                <Table.Th>Launch Reference</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th className="rounded-se-xl"></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {innovationsData?.data?.length ? (
                                innovationsData.data.map((row: InnovationWithStatus) => (
                                    <Table.Tr key={row.id}>
                                        <Table.Td className="first:rounded-es-xl">{row.brand?.name}</Table.Td>
                                        <Table.Td>{row.launch_name}</Table.Td>
                                        <Table.Td>{row.launch_id}</Table.Td>
                                        <Table.Td>{row.launch_ref}</Table.Td>
                                        <Table.Td>{row.status}</Table.Td>
                                        <Table.Td
                                            className="last:rounded-ee-xl text-center !pr-2 cursor-pointer"
                                            onClick={() => handleForecastClick(row)}
                                        >
                                            {row.status === "active" ? <PencilIcon /> : <EyeIcon />}
                                        </Table.Td>
                                    </Table.Tr>
                                ))
                            ) : (
                                <Table.Tr>
                                    <Table.Td colSpan={6} className="text-center py-4">
                                        No data available
                                    </Table.Td>
                                </Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>

                {totalPages > 1 && (
                    <div className="mt-4 flex justify-end">
                        <Pagination
                            totalPages={totalPages}
                            activePage={activePage}
                            setActivePage={setActivePage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default InnovationsForecastsTable;