import {
  Checkbox,
  Group,
  Select,
  Tabs,
  Title
} from "@mantine/core";

import { useForecastTableColumns } from "@/lib/hooks/useForecastTableColumns";
import { Forecast } from "@/routes/_auth/forecasting";
import { ForecastFilters } from "@/types";
import { useField } from "@mantine/form";
import { useState } from "react";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { Table as ReusableTable } from "../Shared/Table";

function ForecastingTable({
  filters,
  fetchMore,
  hasMore,
  setFilters,
  forecasts,
  activeTab,
  setActiveTab,
  isLoading,
  isFetchingNextPage

}: {
  filters: ForecastFilters;
  fetchMore: () => void;
  hasMore: boolean;
  setFilters: (filters: ForecastFilters) => void;
  forecasts: Forecast[];
  activeTab: string | null;
  setActiveTab: (tab: string) => void;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
}) {
  const { Panel } = Tabs;
  const [sortBy, setSortBy] = useState<string | null>(""); // ✅ Sorting state
  const forecastTypeField = useField<string>({ initialValue: "" });

  const handleForecastTypeChange = (
    value: "all" | "saleable" | "nonSaleable"
  ) => {
    forecastTypeField.setValue(value);
    setFilters({
      ...filters,
      type: value === "all" ? "" : value, // Update filters based on selection
    });
  };

  const sortOptions = [
    { value: "brand", label: "Brand" },
    { value: "offering_number", label: "Offering Number" },
    { value: "cost", label: "Cost" },
  ];

  const columnHeaders = forecasts && forecasts[0]?.items
    ? Object.keys(forecasts[0].items)
    : ["Red"];
    
  const columns = useForecastTableColumns(columnHeaders);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-5">
      {/* Table */}
      <Group justify="space-between" className="mb-4">
        <Tabs
          color="#002554"
          className="text-primary hidden sm:block w-full"
          defaultValue="innovation"
          value={activeTab}
          onChange={setActiveTab}
        >
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-start-1 col-end-3 w-full">

              <Tabs.List className="before:border-0">
                <Tabs.Tab value="innovation" className="grow">
                  Innovation forecast
                </Tabs.Tab>
                <Tabs.Tab value="base" className="grow">
                  Base forecast
                </Tabs.Tab>
              </Tabs.List>
            </div>
            <div className="col-start-3 col-end-4 w-full">

              <Group className="grow w-full">
                <Select
                  aria-label="Sort by"
                  placeholder="Sort by"
                  data={sortOptions}
                  value={sortBy}
                  onChange={(v) => {
                    setSortBy(v);
                    setFilters({
                      ...filters,
                      sort: v === "all" ? "" : v as string, // Update filters based on selection
                    });
                  }} // ✅ Trigger sorting
                  clearable
                  className="grow w-full"
                  rightSection={<ChevronDownIcon />}
                />
              </Group>
            </div>
          </div>
          <Panel value="innovation" className="">
            <>

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
                    label="Non-Saleable"
                    size="xs"
                    checked={forecastTypeField.getInputProps().value === "nonSaleable"}
                    onChange={() => handleForecastTypeChange("nonSaleable")}
                  />
                </Group>
              </Group>
              <ReusableTable<Forecast>
                data={forecasts ?? []}
                columns={columns}
                rowKey={(row) => row.product.id}
                fetchMore={fetchMore}
                hasMore={hasMore}
                infiniteScroll={true}
                isLoading={isLoading}
                isFetchingNextPage={isFetchingNextPage}
              />
            </>
          </Panel>
          <Panel value="base" className="">
            <>
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
                    label="Non-Saleable"
                    size="xs"
                    checked={forecastTypeField.getInputProps().value === "nonSaleable"}
                    onChange={() => handleForecastTypeChange("nonSaleable")}
                  />
                </Group>
              </Group>
              <ReusableTable<Forecast>
                data={forecasts ?? []}
                columns={columns}
                rowKey={(row) => row.product.id}
                fetchMore={fetchMore}
                hasMore={hasMore}
                infiniteScroll={true}
                isLoading={isLoading}
                isFetchingNextPage={isFetchingNextPage}
              />
            </>
          </Panel>
        </Tabs>

      </Group>

    </div>
  );
}

export default ForecastingTable;
