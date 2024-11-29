import { Table } from "@mantine/core";
import PencilIcon from "../Icons/PencilIcon";
import ChevronDownIcon from "../Icons/ChevronDownIcon";

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
    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-5">
            {/* Table */}
            <div className="border border-primary rounded-xl border-t-0">
                <Table.ScrollContainer minWidth={1024}>
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
                                        <span className="text-white bg-blue px-[10px] py-0.5 rounded-full">
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

            <div className="flex justify-center items-center mt-6">
                <button className="text-primary opacity-50 text-sm font-medium flex items-center gap-2 pointer-events-none">
                    <span className="transform rotate-90">
                        <ChevronDownIcon />
                    </span>
                    Previous
                </button>
                <div className="flex items-center  mx-4">
                    {[1, 2, 3, 4, 5, "...", 11].map((page, index) => (
                        <button
                            key={index}
                            className={`${
                                page === 2 ? "bg-green " : "bg-transparent"
                            } rounded-full size-10 flex items-center justify-center text-primary text-sm font-medium`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
                <button className="ext-primary gap-2  text-sm font-medium flex items-center">
                    Next
                    <span className="transform -rotate-90">
                        <ChevronDownIcon />
                    </span>
                </button>
            </div>
        </div>
    );
}

export default ProductsTable;
