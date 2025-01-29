import { Grid, NumberInput, Select, Table } from "@mantine/core";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { Fragment, useEffect, useMemo, useState } from "react";
import { DateInput } from "@mantine/dates";
import DateIcon from "../Icons/DateIcon";
import DateChanger from "../Shared/DateChanger";
import { addMonthsToDate, dateToLocalString } from "@/lib/utils";
import OrderFilter from "../DistributorPages/orders/OrdersFilters";
import { ForecastSubmitInput, OrderData } from "@/types";
import { UseFormReturnType } from "@mantine/form";
import get from "lodash.get";
import PaginationComponent from "../Shared/Pagination";

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
  const [itemsPerPage, setItemsPerPage] = useState("5");
  const totalPages = Math.ceil(data.length / parseInt(itemsPerPage));
  const [date, setDate] = useState<Date>(new Date());
  const [filters, setFilters] = useState({
    brand: "",
    brandPillar: "",
    distributor: "",
    launchId: "",
  });
  console.log(filters);

  const sortOptions = [
    {
      value: "product.brand.name",
      label: "Brand",
    },
    {
      value: "product.offering_number",
      label: "Offering Number",
    },
    {
      value: "cost",
      label: "cost",
    },
  ];
  const showOptions = [
    {
      value: "5",
      label: "Show 5",
    },
    {
      value: "10",
      label: "Show 10",
    },
    {
      value: "50",
      label: "Show 50",
    },
    {
      value: "100",
      label: "Show 100",
    },
  ];

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (sortBy) {
      return [
        ...data.sort((a, b) =>
          get(a, sortBy) > get(b, sortBy)
            ? 1
            : get(b, sortBy) > get(a, sortBy)
              ? -1
              : 0
        ),
      ];
    }
    return data;
  }, [sortBy, data]);

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (activePage - 1) * parseInt(itemsPerPage);
    return filteredData.slice(startIndex, startIndex + parseInt(itemsPerPage));
  }, [filteredData, activePage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setActivePage(1);
  }, [sortBy, itemsPerPage]);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-5">
      {/* Table */}
      <Grid justify="space-between" className="mb-4">
        <Grid.Col
          span={{
            base: 12,
          }}
          className="flex gap-4"
        >
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
          <Select
            aria-label="Show 100"
            placeholder="Show 100"
            data={showOptions}
            value={itemsPerPage}
            onChange={(v) => v && setItemsPerPage(v)}
            clearable
            className="grow"
            rightSection={<ChevronDownIcon />}
          />
        </Grid.Col>
        <Grid.Col
          className="flex justify-between"
          span={{
            base: 12,
          }}
        >
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
                <Table.Th className="rounded-ss-xl">Brand</Table.Th>
                <Table.Th>Brand Pillar</Table.Th>
                <Table.Th>SKU</Table.Th>
                <Table.Th>Cost</Table.Th>
                <Table.Th colSpan={2}>{dateToLocalString(date)}</Table.Th>
                <Table.Th colSpan={2}>
                  {dateToLocalString(addMonthsToDate(date, 1))}
                </Table.Th>
                <Table.Th colSpan={2}>
                  {dateToLocalString(addMonthsToDate(date, 2))}
                </Table.Th>
                <Table.Th colSpan={2}>
                  {dateToLocalString(addMonthsToDate(date, 3))}
                </Table.Th>
                <Table.Th colSpan={2}>
                  {dateToLocalString(addMonthsToDate(date, 4))}
                </Table.Th>
                <Table.Th colSpan={2}>
                  {dateToLocalString(addMonthsToDate(date, 5))}
                </Table.Th>
                <Table.Th className="rounded-se-xl">Sub Total</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Thead>
              <Table.Tr className="bg-primary text-white">
                <Table.Th colSpan={4}></Table.Th>
                <Table.Th>Forecast</Table.Th>
                <Table.Th>Order</Table.Th>
                <Table.Th>Forecast</Table.Th>
                <Table.Th>Order</Table.Th>
                <Table.Th>Forecast</Table.Th>
                <Table.Th>Order</Table.Th>
                <Table.Th>Forecast</Table.Th>
                <Table.Th>Order</Table.Th>
                <Table.Th>Forecast</Table.Th>
                <Table.Th>Order</Table.Th>
                <Table.Th>Forecast</Table.Th>
                <Table.Th>Order</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginatedData.map((order, index) => (
                <Table.Tr key={index}>
                  <Table.Td className="first:rounded-es-xl">
                    {order.product.brand.name}
                  </Table.Td>
                  <Table.Td>{order.product.brand.name}</Table.Td>
                  <Table.Td>{order.product.sku}</Table.Td>
                  <Table.Td>{order.cost}</Table.Td>
                  {Object.keys(order.items).map((item, idx) => {
                    return (
                      <Fragment key={`${index}-${idx}`}>
                        <Table.Td>{order.items[item].forecast_value}</Table.Td>
                        <Table.Td>
                          <NumberInput
                            {...form.getInputProps(
                              `order.${index}.items.${idx}.value`
                            )}
                            size="xs"
                            classNames={{
                              input: "!bg-transparent border-none !w-[80px]",
                            }}
                            hideControls
                            allowDecimal={false}
                            allowNegative={false}
                            required
                          />
                        </Table.Td>
                      </Fragment>
                    );
                  })}
                  <Table.Td className="last:rounded-ee-xl text-center !pr-2">
                    {order.sub_total}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </div>
      <PaginationComponent
        activePage={activePage}
        setActivePage={setActivePage}
        totalPages={totalPages}
      />
    </div>
  );
}

export default OrdersTable;
