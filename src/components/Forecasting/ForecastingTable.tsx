import {
  Checkbox,
  Group,
  Loader,
  Select,
  Table,
  Tabs,
  Title,
} from "@mantine/core";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { useEffect, useMemo, useState } from "react";
import { useField } from "@mantine/form";
import EyeIcon from "../Icons/EyeIcon";
import { useNavigate } from "@tanstack/react-router";
import { getForecasts } from "@/api/forecasts/get-forcasts";
import { useQuery } from "@tanstack/react-query";
import { addMonthsToDate, dateToLocalString } from "@/lib/utils";
import get from "lodash.get";
import ErrorCard from "../Shared/ErrorCard";
import PaginationComponent from "../Shared/Pagination";

const elements = [
  {
    brand: "Chloe",
    pillar: "Distributor example",
    sku: "SKU Example",
    launchId: "Brand-SubBrand-Year-Format-LaunchName",
    distributor: "dist1, dist2, dist3",
    offeringNumber: "160439542",
    date1: "00",
    date2: "00",
    date3: "00",
    date4: "00",
    date5: "00",
    date6: "00",
  },
  // Repeat or dynamically generate rows as needed
  ...Array(8).fill({
    brand: "Brand example 2",
    pillar: "Distributor example",
    sku: "SKU Example",
    launchId: "Brand-SubBrand-Year-Format-LaunchName",
    distributor: "dist1, dist2, dist3",
    offeringNumber: "160439542",
    date1: "00",
    date2: "00",
    date3: "00",
    date4: "00",
    date5: "00",
    date6: "00",
  }),
];

function ForecastingTable({
  filters,
}: {
  filters: {
    search: string;
    // startDate: Date;
    // endDate: Date;
    brand: string;
    pillar: string;
    distributor: string;
    launchId: string;
  };
}) {
  const [activePage, setActivePage] = useState(1);
  const [sortBy, setSortBy] = useState<string | null>("");
  const [itemsPerPage, setItemsPerPage] = useState("5");
  const [activeTab, setActiveTab] = useState<string | null>("Innovation");
  const [date, setDate] = useState<Date>(new Date());
  const totalPages = Math.ceil(elements.length / parseInt(itemsPerPage));
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["base-forcasts"],
    queryFn: getForecasts,
  });

  const baseForecastData = data?.data.forecast;

  const forecastTypeField = useField<string>({
    initialValue: "",
  });

  const handleForecastTypeChange = (
    value: "all" | "saleable" | "nonSaleable"
  ) => {
    forecastTypeField.setValue(value);
  };

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
    if (!baseForecastData) return [];
    const newArr = baseForecastData.filter((item) => {
      // Search filter (case-insensitive)
      const searchTerm = filters.search.toLowerCase();
      const searchMatch =
        !filters.search ||
        item.product.brand.name.toLowerCase().includes(searchTerm) ||
        // item.pillar.toLowerCase().includes(searchTerm) ||
        // item.sku.toLowerCase().includes(searchTerm) ||
        // item.launchId.toLowerCase().includes(searchTerm) ||
        item.distributor?.name.toLowerCase().includes(searchTerm) ||
        item.product.offering_number.toLowerCase().includes(searchTerm);

      const filterMatch =
        (!filters.brand || item.product.brand.name === filters.brand) &&
        (!filters.pillar || item.product.brand.name === filters.pillar) &&
        (!filters.distributor ||
          item.distributor?.name === filters.distributor) &&
        (!filters.launchId ||
          item.product.offering_number === filters.launchId);

      return searchMatch && filterMatch;
    });
    if (sortBy) {
      newArr.sort((a, b) =>
        get(a, sortBy) > get(b, sortBy)
          ? 1
          : get(b, sortBy) > get(a, sortBy)
            ? -1
            : 0
      );
    }
    return newArr;
  }, [filters, sortBy, baseForecastData]);

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (activePage - 1) * parseInt(itemsPerPage);
    return filteredData.slice(startIndex, startIndex + parseInt(itemsPerPage));
  }, [filteredData, activePage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setActivePage(1);
  }, [filters, sortBy, itemsPerPage]);

  useEffect(() => {
    if (baseForecastData) {
      const newDate = new Date(
        `1 ${Object.keys(baseForecastData[0].items)[0]}`
      );
      setDate(newDate);
    }
  }, [baseForecastData]);

  if (isError) {
    return <ErrorCard />;
  }

  if (!baseForecastData || isLoading) {
    return (
      <div className="bg-white shadow-md text-center rounded-lg p-6 mt-5">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-5">
      {/* Table */}
      <Group justify="space-between" className="mb-4">
        <Tabs
          color="#002554"
          className="text-primary hidden sm:block"
          defaultValue="Innovation"
          value={activeTab}
          onChange={setActiveTab}
        >
          <Tabs.List className="before:border-0">
            <Tabs.Tab value="Innovation" className="grow">
              Innovation forecast
            </Tabs.Tab>
            <Tabs.Tab value="Base" className="grow">
              Base forecast
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
        <Tabs
          color="#002554"
          className="text-primary sm:hidden grow"
          defaultValue="Innovation"
          value={activeTab}
          onChange={setActiveTab}
          orientation="vertical"
        >
          <Tabs.List className="grow">
            <Tabs.Tab value="Innovation" className="grow">
              Innovation forecast
            </Tabs.Tab>
            <Tabs.Tab value="Base" className="grow">
              Base forecast
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
        </Group>
      </Group>
      <Group className="mb-4">
        <Title order={2} className="text-primary font-semibold text-xl">
          {activeTab} Forecast
        </Title>
        <Group>
          <Checkbox
            label="All"
            size="xs"
            checked={forecastTypeField.getInputProps().value === "all"}
            onChange={() => handleForecastTypeChange("all")}
          />
          <Checkbox
            label="Saleable"
            size="xs"
            checked={forecastTypeField.getInputProps().value === "saleable"}
            onChange={() => handleForecastTypeChange("saleable")}
          />
          <Checkbox
            label="Non-Salebale"
            size="xs"
            checked={forecastTypeField.getInputProps().value === "nonSaleable"}
            onChange={() => handleForecastTypeChange("nonSaleable")}
          />
        </Group>
      </Group>
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
                <Table.Th>Brand pillar</Table.Th>
                <Table.Th>SKU</Table.Th>
                <Table.Th>Launch ID</Table.Th>
                <Table.Th>Distributor</Table.Th>
                <Table.Th>Offering Number</Table.Th>
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
                <Table.Th className="rounded-se-xl"></Table.Th>
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
                  <Table.Td>{element.product.offering_number}</Table.Td>
                  <Table.Td>{element.distributor?.name}</Table.Td>
                  <Table.Td>{element.product.offering_number}</Table.Td>
                  {Object.keys(element.items).map((key, idx) => (
                    <Table.Td key={`${index}-${idx}`}>
                      {element.items[key].value}
                    </Table.Td>
                  ))}
                  <Table.Td
                    className="last:rounded-ee-xl text-center !pr-2 cursor-pointer"
                    onClick={() => {
                      navigate({
                        to: "/forecast-details/$productId",
                        params: { productId: element.product.id.toString() },
                      });
                    }}
                  >
                    <EyeIcon />
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

export default ForecastingTable;
