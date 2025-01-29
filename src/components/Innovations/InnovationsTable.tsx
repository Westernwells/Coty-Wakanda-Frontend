import { Group, Select, Table, Tabs } from "@mantine/core";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { useEffect, useMemo, useState } from "react";
import PencilIcon from "../Icons/PencilIcon";
import PaginationComponent from "../Shared/Pagination";

const elements = [
  {
    id: 1,
    brand: "Brand example",
    offeringNumber: "160439542",
    globalICW: "00 Mar 2024",
    globalOCD: "00 Mar 2024",
    status: "Status example",
  },
  ...Array(10).fill({
    id: 1,
    brand: "Brand example2",
    offeringNumber: "160439540",
    globalICW: "00 Mar 2025",
    globalOCD: "00 Mar 2025",
    status: "Status example2",
  }),
];

function InnovationsTable() {
  const [activePage, setActivePage] = useState(1);
  const [sortBy, setSortBy] = useState<string | null>("");
  const [itemsPerPage, setItemsPerPage] = useState("5");
  const [activeTab, setActiveTab] = useState<string | null>("upcoming");
  const totalPages = Math.ceil(elements.length / parseInt(itemsPerPage));

  const sortOptions = [
    {
      value: "brand",
      label: "Brand",
    },
    {
      value: "offeringNumber",
      label: "Offering number",
    },
    {
      value: "status",
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

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    if (!elements) return [];
    if (sortBy) {
      return [
        ...elements.sort((a, b) =>
          a[sortBy] > b[sortBy] ? 1 : b[sortBy] > a[sortBy] ? -1 : 0
        ),
      ];
    }
    return elements;
  }, [sortBy]);

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
      <Group justify="space-between" className="mb-4">
        <Tabs
          color="#002554"
          className="text-primary hidden sm:block"
          defaultValue="upcoming"
          value={activeTab}
          onChange={setActiveTab}
        >
          <Tabs.List className="before:border-0">
            <Tabs.Tab value="upcoming" className="grow text-base font-medium">
              Upcoming innovations
            </Tabs.Tab>
            <Tabs.Tab value="archived" className="grow text-base font-medium">
              Archived innovations
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
                <Table.Th>Offering Number</Table.Th>
                <Table.Th>Global ICW</Table.Th>
                <Table.Th>Global OCD</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th className="rounded-se-xl"></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginatedData.map((element, index) => (
                <Table.Tr key={index}>
                  <Table.Td className="first:rounded-es-xl">
                    {element.brand}
                  </Table.Td>
                  <Table.Td>{element.offeringNumber}</Table.Td>
                  <Table.Td>{element.globalICW}</Table.Td>
                  <Table.Td>{element.globalOCD}</Table.Td>
                  <Table.Td>{element.status}</Table.Td>
                  <Table.Td
                    className="last:rounded-ee-xl text-center !pr-2 cursor-pointer"
                    onClick={() => {
                      console.log("hehe");
                      // navigate({
                      //   to: "/forecast-details/$forecastId",
                      //   params: { forecastId: element.sku },
                      // });
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

      <PaginationComponent
        activePage={activePage}
        setActivePage={setActivePage}
        totalPages={totalPages}
      />
    </div>
  );
}

export default InnovationsTable;
