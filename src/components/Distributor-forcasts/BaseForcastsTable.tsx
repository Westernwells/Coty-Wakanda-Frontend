import {
  Grid,
  Loader,
  Pagination,
  Select,
  Table,
  TextInput,
} from "@mantine/core";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { useEffect, useMemo, useState } from "react";
import { DateInput } from "@mantine/dates";
import DateIcon from "../Icons/DateIcon";
import DateChanger from "../Shared/DateChanger";
import { addMonthsToDate, dateToLocalString } from "@/lib/utils";
import { ForecastData, ForecastSubmitInput } from "@/types";
import { UseFormReturnType } from "@mantine/form";

const elements = [
  {
    id: 1,
    brand: "Brand example",
    brandPillars: "Brand Pillar example",
    sku: "SKU Example",
    cost: "00$",
    monthlyTotals: "00$",
    date1: "00",
    date2: "00",
    date3: "00",
    date4: "00",
    date5: "00",
    date6: "00",
    subtotal: "00",
  },
  ...Array(10).fill({
    id: 2,
    brand: "Brand example2",
    brandPillars: "Brand Pillar example3",
    sku: "SKU Example4",
    cost: "10$",
    monthlyTotals: "10$",
    date1: "01",
    date2: "02",
    date3: "03",
    date4: "04",
    date5: "05",
    date6: "06",
    subtotal: "00",
  }),
];

function BaseForecastsTable({
  showDateChanger = false,
  isSales = false,
  data,
  form,
}: {
  showDateChanger?: boolean;
  isSales?: boolean;
  data: ForecastData[] | undefined;
  form:  UseFormReturnType<ForecastSubmitInput[], (values: ForecastSubmitInput[]) => ForecastSubmitInput[]>
}) {
  const [activePage, setActivePage] = useState(1);
  const [sortBy, setSortBy] = useState<keyof ForecastData | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState("5");
  const totalPages = Math.ceil(elements.length / parseInt(itemsPerPage));
  const [date, setDate] = useState<Date>(new Date());

  const sortOptions: { value: keyof ForecastData; label: string }[] = [
    {
      value: "monthly_total",
      label: "Brand",
    },
    {
      value: "cost",
      label: "cost",
    },
    {
      value: "sub_total",
      label: "Status",
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

  useEffect(() => {
    if (data) {
      const newDate = new Date(`1 ${Object.keys(data[0].items)[0]}`);
      setDate(newDate);
    }
  }, [data]);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (sortBy) {
      return [
        ...data.sort((a, b) =>
          a[sortBy] > b[sortBy] ? 1 : b[sortBy] > a[sortBy] ? -1 : 0
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

  if (!data) {
    return <Loader />;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-5">
      {/* Table */}
      <Grid justify="space-between" className="mb-4">
        <Grid.Col
          span={{
            base: 12,
            md: 8,
            lg: 9,
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
            onChange={(v) => setSortBy(v as keyof ForecastData)}
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
        {showDateChanger && (
          <Grid.Col
            className="md:justify-end justify-center items-center flex"
            span={{
              base: 12,
              md: 4,
              lg: 3,
            }}
          >
            <DateChanger date={date} setDate={setDate} />
          </Grid.Col>
        )}
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
                {!isSales && <Table.Th>Monthly Totals</Table.Th>}
                <Table.Th>{dateToLocalString(date)}</Table.Th>
                <Table.Th>
                  {dateToLocalString(addMonthsToDate(date, 1))}
                </Table.Th>
                <Table.Th>
                  {dateToLocalString(addMonthsToDate(date, 2))}
                </Table.Th>
                <Table.Th>
                  {dateToLocalString(addMonthsToDate(date, 3))}
                </Table.Th>
                <Table.Th>
                  {dateToLocalString(addMonthsToDate(date, 4))}
                </Table.Th>
                <Table.Th>
                  {dateToLocalString(addMonthsToDate(date, 5))}
                </Table.Th>
                <Table.Th className="rounded-se-xl">Sub Total</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginatedData.map((element, index) => (
                <Table.Tr key={index}>
                  <Table.Td className="first:rounded-es-xl">
                    {element.product.brand.name}
                  </Table.Td>
                  <Table.Td>{element.product.brand.name}</Table.Td>
                  <Table.Td>{element.product.offering_number}</Table.Td>
                  <Table.Td>{element.cost}</Table.Td>
                  {!isSales && <Table.Td>{element.monthly_total}</Table.Td>}
                  {Object.keys(element.items).map((_item, idx) => {
                    return (
                      <Table.Td key={`${index}-${idx}`}>
                        <TextInput
                          size="xs"
                          classNames={{ input: "!bg-transparent !w-[80px]" }}
                          {...form.getInputProps(
                            `${index}.items.${idx}.value`
                          )}
                        />
                      </Table.Td>
                    );
                  })}
                  <Table.Td className="last:rounded-ee-xl !pr-2">
                    {element.sub_total}
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
                  "text-primary text-sm font-medium data-[active=true]:bg-green  border-none size-10 ",
              }}
            >
              <Pagination.Previous
                className="w-auto pe-5"
                icon={() => {
                  return (
                    <button className="text-primary opacity-50 text-sm font-medium flex items-center gap-2 pointer-events-none">
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
                className="w-auto ps-5"
                icon={() => {
                  return (
                    <button className="text-primary gap-2  text-sm font-medium flex items-center">
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
      )}
    </div>
  );
}

export default BaseForecastsTable;
