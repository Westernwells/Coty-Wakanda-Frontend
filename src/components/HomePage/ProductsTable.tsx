import { Table } from "@mantine/core";
import PencilIcon from "../Icons/PencilIcon";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import EyeIcon from "../Icons/EyeIcon";
import { Filters, Product } from "@/types";
import { useInView } from "react-intersection-observer";

function ProductsTable({
    filters,
    data,
}: {
    data: Product[];
    filters: Filters;
}) {
    const [activePage, setActivePage] = useState(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();
    const { ref, inView } = useInView({
        threshold: 1,
        delay: 100,
        trackVisibility: true,
    });
    const role = useUserStore((state) => state.user)?.role;

    const filteredData = useMemo(() => {
        if (!data) return [];

        return data.filter((item) => {
            const searchTerm = filters.search.toLowerCase();
            const searchMatch =
                !filters.search ||
                item.category.name.toLowerCase().includes(searchTerm) ||
                item.house.toLowerCase().includes(searchTerm) ||
                item.gender.toLowerCase().includes(searchTerm);

            const brandMatch =
                !filters.brand ||
                item.brand.name.toLowerCase() === filters.brand.toLowerCase();

            // ✅ Filter by distributor ID from distributor_pricing
            const distributorMatch =
                !filters.distributor ||
                item.distributor_pricing.some(
                    (pricing) =>
                        pricing.distributor.id.toString() ===
                        filters.distributor
                );

            // ✅ Filter by brand type (Luxury, Mass Market, etc.)
            const brandTypeMatch =
                !filters.brandType ||
                item.brand.type.toLowerCase() ===
                    filters.brandType.toLowerCase();

            return (
                searchMatch && brandMatch && distributorMatch && brandTypeMatch
            );
        });
    }, [data, filters]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginatedData = useMemo(() => {
        return filteredData.slice(0, activePage * itemsPerPage);
    }, [filteredData, activePage, itemsPerPage]);

    // Load more products when user reaches the bottom
    useEffect(() => {
        if (inView && activePage < totalPages) {
            setActivePage((prev) => prev + 1);
        }
    }, [inView, activePage, totalPages]);

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
                                    Brand
                                </Table.Th>
                                <Table.Th>Brand Type</Table.Th>
                                <Table.Th>Brand Pillar</Table.Th>
                                <Table.Th>Description</Table.Th>
                                <Table.Th>Distributor</Table.Th>
                                <Table.Th>IRC</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th className="rounded-se-xl"></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {paginatedData.map((product, index) => (
                                <Table.Tr
                                    key={product.id}
                                    ref={
                                        index === paginatedData.length - 1
                                            ? ref
                                            : null
                                    }
                                >
                                    <Table.Td className="first:rounded-es-xl">
                                        {product.brand.name}
                                    </Table.Td>
                                    <Table.Td>{product.brand.type}</Table.Td>
                                    <Table.Td>{product.brand.name}</Table.Td>
                                    <Table.Td>
                                        {product.material_description}
                                    </Table.Td>
                                    <Table.Td>
                                        {product.distributor_pricing
                                            .map((p) => p.distributor.name)
                                            .join(", ")}
                                    </Table.Td>
                                    <Table.Td>{product.irc}</Table.Td>
                                    <Table.Td>
                                        <span className="text-white bg-blue px-[10px] py-0.5 rounded-full text-nowrap">
                                            {product.pref}
                                        </span>
                                    </Table.Td>
                                    {role === "admin" ? (
                                        <Table.Td
                                            className="last:rounded-ee-xl text-center !pr-2 cursor-pointer"
                                            onClick={() => {
                                                navigate({
                                                    to: "/edit-product/$productId",
                                                    params: {
                                                        productId: `${product.id}`,
                                                    },
                                                });
                                            }}
                                        >
                                            <PencilIcon />
                                        </Table.Td>
                                    ) : (
                                        <Table.Td
                                            className="last:rounded-ee-xl text-center !pr-2 cursor-pointer"
                                            onClick={() => {
                                                navigate({
                                                    to: "/products/$productId",
                                                    params: {
                                                        productId: `${product.id}`,
                                                    },
                                                });
                                            }}
                                        >
                                            <EyeIcon />
                                        </Table.Td>
                                    )}
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            </div>
        </div>
    );
}

export default ProductsTable;
