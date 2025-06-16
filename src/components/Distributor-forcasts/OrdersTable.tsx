import { Grid, NumberInput, Select, Table } from "@mantine/core";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { Fragment, useEffect, useMemo, useState } from "react";
import { DateInput } from "@mantine/dates";
import DateIcon from "../Icons/DateIcon";
import DateChanger from "../Shared/DateChanger";
import OrderFilter from "../DistributorPages/orders/OrdersFilters";
import { ForecastSubmitInput, OrderData } from "@/types";
import { UseFormReturnType } from "@mantine/form";
import get from "lodash.get";
import { useInView } from "react-intersection-observer";
import clsx from "clsx";
import { array } from "zod";

function OrdersTable({
    data,
    form,
}: {
    data: OrderData[];
    form: UseFormReturnType<
        {
            order: ForecastSubmitInput[];
        },
        (values: { order: ForecastSubmitInput[] }) => {
            order: ForecastSubmitInput[];
        }
    >;
}) {
    const [activePage, setActivePage] = useState(1);
    const [sortBy, setSortBy] = useState<string | null>("");
    const itemsPerPage = 10;
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const [date, setDate] = useState<Date>(new Date());
    const [_, setFilters] = useState({
        brand: "",
        brandPillar: "",
        distributor: "",
        launchId: "",
    });

    const { ref, inView } = useInView({
        threshold: 1,
        delay: 100,
        trackVisibility: true,
    });

    const sortOptions = [
        { value: "product.brand.name", label: "Brand" },
        { value: "product.offering_number", label: "Offering Number" },
        { value: "cost", label: "Cost" },
    ];

    // Sort and filter data
    const filteredData = useMemo(() => {
        if (!data) return [];
        if (sortBy) {
            return [...data].sort((a, b) =>
                get(a, sortBy) > get(b, sortBy)
                    ? 1
                    : get(b, sortBy) > get(a, sortBy)
                      ? -1
                      : 0
            );
        }
        return data;
    }, [sortBy, data]);

    // Load more data dynamically when scrolling
    const paginatedData = useMemo(() => {
        return filteredData.slice(0, activePage * itemsPerPage);
    }, [filteredData, activePage]);

    // Load more data when reaching the bottom
    useEffect(() => {
        if (inView && activePage < totalPages) {
            setActivePage((prev) => prev + 1);
        }
    }, [inView, activePage, totalPages]);

    useEffect(() => {
        if (data) {
            const newDate = new Date(`1 ${Object.keys(data[0].items)[0]}`);
            setDate(newDate);
        }
    }, [data]);

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-5">
            {/* Table Filters */}
            <Grid justify="space-between" className="mb-4">
                <Grid.Col span={{ base: 12 }} className="flex gap-4">
                    <DateInput
                        aria-label="Start Date"
                        placeholder="Start Date"
                        clearable
                        variant="filled"
                        className="grow"
                        rightSection={<DateIcon />}
                    />
                    <DateInput
                        aria-label="End Date"
                        placeholder="End Date"
                        clearable
                        variant="filled"
                        className="grow"
                        rightSection={<DateIcon />}
                    />
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
                </Grid.Col>
                <Grid.Col className="flex justify-between" span={{ base: 12 }}>
                    <Grid w={"100%"}>
                        <Grid.Col span={{ base: 9 }}>
                            <OrderFilter setFilters={setFilters} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 3 }}>
                            <DateChanger date={date} setDate={setDate} />
                        </Grid.Col>
                    </Grid>
                </Grid.Col>
            </Grid>

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
                                <Table.Th className="rounded-ss-xl border-r-2 " rowSpan={2}>
                                    Brand
                                </Table.Th>
                                <Table.Th className="border-r-2" rowSpan={2}>Brand Pillar</Table.Th>
                                <Table.Th className="border-r-2" rowSpan={2}>SKU</Table.Th>
                                <Table.Th className="border-r-2" rowSpan={2}>Cost</Table.Th>
                                {Object.keys(data[0].items).map((date) => (
                                    <Table.Th key={date} colSpan={2} className={"border-r-2"}>
                                        {date}
                                    </Table.Th>
                                ))}
                                <Table.Th className="rounded-se-xl">
                                    Sub Total
                                </Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Thead>
                            <Table.Tr className="bg-primary text-white">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <Fragment key={index}>
                                        <Table.Th className={index !== 3 ? "border-r-2" : ""}></Table.Th>
                                    </Fragment>
                                ))}
                                {Object.keys(data[0].items).map((date, index) => (
                                    <Fragment key={date}>
                                        <Table.Th className="border-l-2">Forecast</Table.Th>
                                        <Table.Th className={Object.keys(data[0].items)?.length == index+1 ? "border-r-2" : ""}>Order</Table.Th>
                                    </Fragment>
                                ))}
                                <Table.Th></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {paginatedData.map((order, index) => (
                                <Table.Tr
                                    key={index}
                                    ref={
                                        index === paginatedData.length - 1
                                            ? ref
                                            : null
                                    }
                                >
                                    <Table.Td className="first:rounded-es-xl">
                                        {order.product.brand.name}
                                    </Table.Td>
                                    <Table.Td>
                                        {order.product.brand.name}
                                    </Table.Td>
                                    <Table.Td>{order.product.sku}</Table.Td>
                                    <Table.Td>{order.cost}</Table.Td>
                                    {Object.keys(order.items).map(
                                        (item, idx) => (
                                            <Fragment key={`${index}-${idx}`}>
                                                <Table.Td>
                                                    {
                                                        order.items[item]
                                                            .forecast_value
                                                    }
                                                </Table.Td>
                                                <Table.Td>
                                                    <NumberInput
                                                        {...form.getInputProps(
                                                            `order.${index}.items.${idx}.value`
                                                        )}
                                                        size="xs"
                                                        classNames={{
                                                            input: clsx(
                                                                "!w-[80px]",
                                                                {
                                                                    "!bg-red-400/40 border-none":
                                                                        order
                                                                            .items[
                                                                            item
                                                                        ]
                                                                            .value &&
                                                                        order
                                                                            .items[
                                                                            item
                                                                        ]
                                                                            .is_closed,
                                                                    "!bg-lime-300/40 border-none":
                                                                        order
                                                                            .items[
                                                                            item
                                                                        ]
                                                                            .value &&
                                                                        !order
                                                                            .items[
                                                                            item
                                                                        ]
                                                                            .is_closed,
                                                                    "!bg-primary/40 border-2 border-primary":
                                                                        order
                                                                            .items[
                                                                            item
                                                                        ]
                                                                            .value ===
                                                                        0,
                                                                }
                                                            ),
                                                        }}
                                                        hideControls
                                                        allowDecimal={false}
                                                        allowNegative={false}
                                                        required
                                                        disabled={
                                                            order.items[item]
                                                                .is_closed
                                                        }
                                                    />
                                                </Table.Td>
                                            </Fragment>
                                        )
                                    )}
                                    <Table.Td className="last:rounded-ee-xl text-center !pr-2">
                                        {order.sub_total}
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

export default OrdersTable;
