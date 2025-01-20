import { Pagination, Table } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";

import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { Distributor, Filters } from "@/types";
import PencilIcon from "../Icons/PencilIcon";
import { useNavigate } from "@tanstack/react-router";

function DistributorsTable({
    data,
    filters,
}: {
    data: Distributor[] | undefined;
    filters: Filters;
}) {
    const [activePage, setActivePage] = useState(1);
    const itemsPerPage = 10;

    // Filter data based on search and filters
    const filteredData = useMemo(() => {
        if (!data) return [];

        return data.filter((item) => {
            // Search filter (case-insensitive)
            const searchTerm = filters.search.toLowerCase();
            const searchMatch =
                !filters.search ||
                item.name.toLowerCase().includes(searchTerm) ||
                item.contact_person.toLowerCase().includes(searchTerm) ||
                item.contact_email.toLowerCase().includes(searchTerm);

            // Region filter
            const regionMatch =
                !filters.region ||
                item.regions.some(
                    (region) =>
                        region.name.toLowerCase() ===
                        filters.region.toLowerCase()
                );

            // Market filter
            const marketMatch =
                !filters.market ||
                item.markets.some(
                    (market) =>
                        market.name.toLowerCase() ===
                        filters.market.toLowerCase()
                );

            return searchMatch && regionMatch && marketMatch;
        });
    }, [data, filters]);

    const navigate = useNavigate();

    // Calculate paginated data
    const paginatedData = useMemo(() => {
        const startIndex = (activePage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, activePage]);

    // Reset to first page when filters change
    useEffect(() => {
        setActivePage(1);
    }, [filters]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-5">
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
                                    Distributor name
                                </Table.Th>
                                <Table.Th>Regions</Table.Th>
                                <Table.Th>Markets</Table.Th>
                                <Table.Th>Contact person</Table.Th>
                                <Table.Th>Contact email</Table.Th>
                                <Table.Th className="rounded-se-xl"></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {paginatedData.map((element, index) => (
                                <Table.Tr key={index}>
                                    <Table.Td className="first:rounded-es-xl">
                                        {element.name}
                                    </Table.Td>
                                    <Table.Td>
                                        {element.regions
                                            .map((region) => region.name)
                                            .join(", ")}
                                    </Table.Td>
                                    <Table.Td>
                                        {element.markets
                                            .map((market) => market.name)
                                            .join(", ")}
                                    </Table.Td>
                                    <Table.Td>
                                        {element.contact_person}
                                    </Table.Td>
                                    <Table.Td>{element.contact_email}</Table.Td>
                                    <Table.Td
                                        className="last:rounded-ee-xl text-center !pr-2 cursor-pointer"
                                        onClick={() => {
                                            navigate({
                                                to: "/edit-distributors/$distributorId",
                                                params: {
                                                    distributorId:
                                                        element.id.toString(),
                                                },
                                            });
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

            {totalPages > 1 && (
                <div className="flex justify-center mt-6 w-full">
                    <div className="hidden sm:block">
                        <Pagination.Root
                            total={totalPages}
                            value={activePage}
                            onChange={setActivePage}
                            color="#00EBB2"
                            radius="xl"
                            siblings={1}
                            boundaries={3}
                            classNames={{
                                root: "w-full flex justify-center items-center",
                                control:
                                    "text-primary text-sm font-medium data-[active=true]:bg-green border-none size-10",
                            }}
                        >
                            <Pagination.Previous
                                icon={() => (
                                    <button className="text-primary opacity-50 text-sm font-medium flex items-center gap-2 pointer-events-none pr-20">
                                        <span className="transform rotate-90">
                                            <ChevronDownIcon />
                                        </span>
                                        Previous
                                    </button>
                                )}
                            />
                            <Pagination.Items />
                            <Pagination.Next
                                icon={() => (
                                    <button className="text-primary gap-2 text-sm font-medium flex items-center pl-4">
                                        Next
                                        <span className="transform -rotate-90">
                                            <ChevronDownIcon />
                                        </span>
                                    </button>
                                )}
                            />
                        </Pagination.Root>
                    </div>
                    {/* Mobile pagination */}
                    <div className="sm:hidden w-full">
                        <Pagination.Root
                            total={totalPages}
                            value={activePage}
                            onChange={setActivePage}
                            color="#00EBB2"
                            radius="xl"
                            siblings={1}
                            boundaries={1}
                            classNames={{
                                root: "w-full flex justify-center",
                                control:
                                    "text-primary text-sm font-medium data-[active=true]:bg-green border-none",
                            }}
                        >
                            <Pagination.Previous
                                icon={() => (
                                    <button className="text-primary opacity-50 text-sm font-medium flex items-center gap-2 pointer-events-none pr-4">
                                        <span className="transform rotate-90">
                                            <ChevronDownIcon />
                                        </span>
                                        Previous
                                    </button>
                                )}
                            />
                            <Pagination.Items />
                            <Pagination.Next
                                icon={() => (
                                    <button className="text-primary gap-2 text-sm font-medium flex items-center pl-4">
                                        Next
                                        <span className="transform -rotate-90">
                                            <ChevronDownIcon />
                                        </span>
                                    </button>
                                )}
                            />
                        </Pagination.Root>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DistributorsTable;
