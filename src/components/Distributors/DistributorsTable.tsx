import { Loader, Table } from "@mantine/core";
import { useEffect, useState } from "react";
import { Distributor, Filters, Meta } from "@/types";
import PencilIcon from "../Icons/PencilIcon";
import { useNavigate } from "@tanstack/react-router";
import { getDistributors } from "@/api/distributors/get-distributors";
import InfiniteScroll from "react-infinite-scroll-component";

function DistributorsTable({
    filters,
    initialData,
    initialMeta,
}: {
    initialData: Distributor[];
    initialMeta: Meta;
    filters: Filters;
}) {
    const navigate = useNavigate();

    const [distributors, setDistributors] =
        useState<Distributor[]>(initialData);
    const [meta, setMeta] = useState<Meta>(initialMeta);
    const [hasMore, setHasMore] = useState(initialMeta.has_next);

    // ✅ Reset product list when filters change
    useEffect(() => {
        setDistributors(initialData);
        setMeta(initialMeta);
        setHasMore(initialMeta.has_next);
    }, [filters, initialData, initialMeta]);

    const fetchMoreDistributors = async () => {
        if (!meta?.has_next) return;

        try {
            const response = await getDistributors({
                cursor: meta.cursor,
                page_size: 20,
                filter: filters,
            });

            setDistributors((prev) => [...prev, ...response.data]);
            setMeta(response.meta);
            setHasMore(response.meta.has_next);
        } catch (error) {
            console.error("Error fetching more distributors:", error);
            setHasMore(false);
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-5">
            <div className="relative border border-primary rounded-xl border-t-0">
                <InfiniteScroll
                    dataLength={distributors.length}
                    next={fetchMoreDistributors}
                    hasMore={hasMore}
                    loader={
                        <div className="text-center py-4">
                            <Loader size="md" />
                        </div>
                    }
                    endMessage={
                        <p className="text-center text-gray-500 py-4">
                            No more distributors to load.
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
                                {distributors.map((element) => (
                                    <Table.Tr key={element.id}>
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
                                        <Table.Td>
                                            {element.contact_email}
                                        </Table.Td>
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
                </InfiniteScroll>
            </div>
        </div>
    );
}

export default DistributorsTable;
