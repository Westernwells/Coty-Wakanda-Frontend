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
import { useMemo, useState } from "react";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { Table as ReusableTable } from "../Shared/Table";
import { SetFieldValue } from "node_modules/@mantine/form/lib/types";
import { ColumnDef } from "@tanstack/react-table";

function ForecastingTable({
  fetchMore,
  hasMore,
  forecasts,
  activeTab,
  setActiveTab,
  isLoading,
  isFetchingNextPage,
  setFieldValue,
  filters

}: {
  fetchMore: () => void;
  hasMore: boolean;
  forecasts: Forecast[];
  activeTab: "base" | "innovation";
  setActiveTab: (tab: "base" | "innovation") => void;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  setFieldValue: SetFieldValue<ForecastFilters>;
  filters: ForecastFilters;
}) {
  const { Panel } = Tabs;
  const [sort, setSortBy] = useState<string | null>(filters?.sort ?? ""); // ✅ Sorting state
  const forecastTypeField = useField<string>({ initialValue:useMemo(() => filters?.type || "all", [filters?.type]) });

  const handleForecastTypeChange = (
    value: "all" | "sealable" | "non-sealable"
  ) => {
    forecastTypeField.setValue(value);
  setFieldValue("type", value); // Update the form state
  };

  const sortOptions = [
    { value: "brand", label: "Brand" },
    { value: "offering_number", label: "Offering Number" },
    { value: "cost", label: "Cost" },
  ];

  const columnHeaders = forecasts && forecasts[0]?.items
    ? Object.keys(forecasts[0].items)
    : [];
    
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
          onChange={(value)=>{
            if (!value) return;
            const val = value as "base" | "innovation";
            setActiveTab(val);
          }}
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
                  value={filters?.sort ?? null}
                  onChange={(v) => {
                    setSortBy(v);
                    setFieldValue("sort", v === "all" ? "" : v as string); // ✅ Update filters based on selection
                    
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
                    checked={filters?.type === "all" || filters?.type === ""}
                    onChange={() => handleForecastTypeChange("all")}
                  />
                  <Checkbox
                    label="Saleable"
                    size="xs"
                    checked={filters?.type === "sealable"}
                    onChange={() => handleForecastTypeChange("sealable")}
                  />
                  <Checkbox
                    label="Non-Saleable"
                    size="xs"
                    checked={filters?.type === "non-sealable"}
                    onChange={() => handleForecastTypeChange("non-sealable")}
                  />
                </Group>
              </Group>
              <ReusableTable<Forecast>
                data={forecasts ?? []}
                columns={columns as unknown as ColumnDef<Forecast, any>[]}
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
                    checked={filters?.type === "all" || filters?.type === ""}
                    onChange={() => handleForecastTypeChange("all")}
                  />
                  <Checkbox
                    label="Saleable"
                    size="xs"
                    checked={filters?.type === "sealable"}
                    onChange={() => handleForecastTypeChange("sealable")}
                  />
                  <Checkbox
                    label="Non-Saleable"
                    size="xs"
                    checked={filters?.type === "non-sealable"}
                    onChange={() => handleForecastTypeChange("non-sealable")}
                  />
                </Group>
              </Group>
              <ReusableTable<Forecast>
                data={forecasts ?? []}
                columns={columns as unknown as ColumnDef<Forecast, any>[]}
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
