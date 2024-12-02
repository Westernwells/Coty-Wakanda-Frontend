import { Pagination, Table } from "@mantine/core";
import PencilIcon from "../Icons/PencilIcon";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { useState } from "react";

const elements = [
    {
        brand: "Brand example",
        pillar: "Distributor example",
        description: "Description example",
        distributor: "dist1, dist2, dist3",
        irc: "99350214927",
        status: "Status example",
    },
    // Repeat or dynamically generate rows as needed
    ...Array(8).fill({
        brand: "Brand example",
        pillar: "Distributor example",
        description: "Description example",
        distributor: "dist1, dist2, dist3",
        irc: "99350214927",
        status: "Status example",
    }),
];

function ProductsTable() {
    const [activePage, setActivePage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(elements.length / itemsPerPage);

    // Get current page items

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-5">
            {/* Table */}
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
                                <Table.Th>Description</Table.Th>
                                <Table.Th>Distributor</Table.Th>
                                <Table.Th>IRC</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th className="rounded-se-xl"></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {elements.map((element, index) => (
                                <Table.Tr key={index}>
                                    <Table.Td className="first:rounded-es-xl">
                                        {element.brand}
                                    </Table.Td>
                                    <Table.Td>{element.pillar}</Table.Td>
                                    <Table.Td>{element.description}</Table.Td>
                                    <Table.Td>{element.distributor}</Table.Td>
                                    <Table.Td>{element.irc}</Table.Td>
                                    <Table.Td>
                                        <span className="text-white bg-blue px-[10px] py-0.5 rounded-full text-nowrap">
                                            {element.status}
                                        </span>
                                    </Table.Td>
                                    <Table.Td className="last:rounded-ee-xl text-center !pr-2">
                                        <PencilIcon />
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            </div>

            <div className="flex justify-center mt-6 w-full">
                <div className="hidden sm:block">
                    <Pagination.Root
                        total={15}
                        value={activePage}
                        onChange={setActivePage}
                        color="#00EBB2"
                        radius="xl"
                        siblings={1}
                        boundaries={3}
                        classNames={{
                            root: "w-full flex justify-center items-center",
                            control:
                                "text-primary text-sm font-medium data-[active=true]:bg-green  border-none size-10 ",
                        }}
                    >
                        <Pagination.Previous
                            icon={() => {
                                return (
                                    <button className="text-primary opacity-50 text-sm font-medium flex items-center gap-2 pointer-events-none pr-20">
                                        <span className="transform rotate-90">
                                            <ChevronDownIcon />
                                        </span>
                                        Previous
                                    </button>
                                );
                            }}
                        />
                        <Pagination.Items />
                        <Pagination.Next
                            icon={() => {
                                return (
                                    <button className="text-primary gap-2  text-sm font-medium flex items-center pl-4">
                                        Next
                                        <span className="transform -rotate-90">
                                            <ChevronDownIcon />
                                        </span>
                                    </button>
                                );
                            }}
                        />
                    </Pagination.Root>
                </div>
                <div className="sm:hidden  w-full">
                    <Pagination.Root
                        total={totalPages}
                        value={activePage}
                        onChange={setActivePage}
                        color="#00EBB2"
                        radius="xl"
                        siblings={1}
                        boundaries={1}
                        classNames={{
                            root: "w-full flex justify-center ",
                            control:
                                "text-primary text-sm font-medium data-[active=true]:bg-green  border-none",
                        }}
                    >
                        <Pagination.Previous
                            icon={() => {
                                return (
                                    <button className="text-primary opacity-50 text-sm font-medium flex items-center gap-2 pointer-events-none pr-4">
                                        <span className="transform rotate-90">
                                            <ChevronDownIcon />
                                        </span>
                                        Previous
                                    </button>
                                );
                            }}
                        />
                        <Pagination.Items />
                        <Pagination.Next
                            icon={() => {
                                return (
                                    <button className="text-primary gap-2  text-sm font-medium flex items-center pl-4">
                                        Next
                                        <span className="transform -rotate-90">
                                            <ChevronDownIcon />
                                        </span>
                                    </button>
                                );
                            }}
                        />
                    </Pagination.Root>
                </div>
            </div>
        </div>
    );
}

export default ProductsTable;
