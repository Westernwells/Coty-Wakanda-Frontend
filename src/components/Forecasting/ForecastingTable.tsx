import {
  Checkbox,
  Group,
  Pagination,
  Select,
  Table,
  Tabs,
  Title,
} from "@mantine/core";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { useEffect, useMemo, useState } from "react";
import { useField } from "@mantine/form";
import EyeIcon from "../Icons/EyeIcon";

const elements = [
  {
    brand: "Chloe",
    pillar: "Distributor example",
    sku: "SKU Example",
    launchId: "Brand-SubBrand-Year-Format-LaunchName",
    distributer: "dist1, dist2, dist3",
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
    distributer: "dist1, dist2, dist3",
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
    distributer: string;
    launchId: string;
  };
}) {
  const [activePage, setActivePage] = useState(1);
  const [sortBy, setSortBy] = useState<string | null>("");
  const [itemsPerPage, setItemsPerPage] = useState("5");
  const [activeTab, setActiveTab] = useState<string | null>("Innovation");
  const totalPages = Math.ceil(elements.length / parseInt(itemsPerPage));
  console.log(totalPages);

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
      value: "brand",
      label: "Brand",
    },
    {
      value: "pillar",
      label: "Pillar",
    },
    {
      value: "sku",
      label: "SKU",
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
    if (!elements) return [];
    const newArr = elements.filter((item) => {
      // Search filter (case-insensitive)
      const searchTerm = filters.search.toLowerCase();
      const searchMatch =
        !filters.search ||
        item.brand.toLowerCase().includes(searchTerm) ||
        item.pillar.toLowerCase().includes(searchTerm) ||
        item.sku.toLowerCase().includes(searchTerm) ||
        item.launchId.toLowerCase().includes(searchTerm) ||
        item.distributer.toLowerCase().includes(searchTerm) ||
        item.offeringNumber.toLowerCase().includes(searchTerm);

      const filterMatch =
        (!filters.brand || item.brand === filters.brand) &&
        (!filters.pillar || item.pillar === filters.pillar) &&
        (!filters.distributer || item.distributer === filters.distributer) &&
        (!filters.launchId || item.launchId === filters.launchId);

      return searchMatch && filterMatch;
    });
    if (sortBy) {
      newArr.sort((a, b) =>
        a[sortBy] > b[sortBy] ? 1 : b[sortBy] > a[sortBy] ? -1 : 0
      );
    }
    return newArr;
  }, [filters, sortBy]);

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (activePage - 1) * parseInt(itemsPerPage);
    return filteredData.slice(startIndex, startIndex + parseInt(itemsPerPage));
  }, [filteredData, activePage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setActivePage(1);
  }, [filters, sortBy, itemsPerPage]);

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
                <Table.Th>Mar 25</Table.Th>
                <Table.Th>Apr 25</Table.Th>
                <Table.Th>May 25</Table.Th>
                <Table.Th>Jun 25</Table.Th>
                <Table.Th>Jul 25</Table.Th>
                <Table.Th>Aug 25</Table.Th>
                <Table.Th className="rounded-se-xl"></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginatedData.map((element, index) => (
                <Table.Tr key={index}>
                  <Table.Td className="first:rounded-es-xl">
                    {element.brand}
                  </Table.Td>
                  <Table.Td>{element.pillar}</Table.Td>
                  <Table.Td>{element.sku}</Table.Td>
                  <Table.Td>{element.launchId}</Table.Td>
                  <Table.Td>{element.distributer}</Table.Td>
                  <Table.Td>{element.offeringNumber}</Table.Td>
                  <Table.Td>{element.date1}</Table.Td>
                  <Table.Td>{element.date2}</Table.Td>
                  <Table.Td>{element.date3}</Table.Td>
                  <Table.Td>{element.date4}</Table.Td>
                  <Table.Td>{element.date5}</Table.Td>
                  <Table.Td>{element.date6}</Table.Td>
                  <Table.Td
                    className="last:rounded-ee-xl text-center !pr-2 cursor-pointer"
                    onClick={() => {
                      console.log("clicked");
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

export default ForecastingTable;
