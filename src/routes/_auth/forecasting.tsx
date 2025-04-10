import { getDistributors } from "@/api/distributors/get-distributors";
import { getForecasts } from "@/api/forecasts/get-forcasts";
import ForecastingFilters from "@/components/Forecasting/ForecastingFilters";
import ForecastingGraphs from "@/components/Forecasting/ForecastingGraphs";
import ForecastingTable from "@/components/Forecasting/ForecastingTable";
import Headline from "@/components/Shared/Headline";
import { ForecastFilters } from "@/types";
import { Divider, Loader, Tabs } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_auth/forecasting")({
  component: RouteComponent,
});

function RouteComponent() {
  const [filter, setFilter] = useState<ForecastFilters>({
    search: "",
    start_date: "",
    end_date: "",
    launch_id: "",
    brand_id: "",
    sub_brand_id: "",
    distributor_id: "",
    brand_type: "",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["forecasts", filter], // ✅ Filters trigger refetch
    queryFn: () =>
      getForecasts({
        cursor: 1,
        page_size: 20,
        filter,
      }),
  });

  const { data: distributorData, isLoading: isDistributorsLoading } = useQuery({
    queryKey: ["distributors"],
    queryFn: () => getDistributors({ page_size: 100 }),
  });
  const [activeTab, setActiveTab] = useState<string | null>("Total");

  if (error || (!isLoading && !data && !isDistributorsLoading)) {
    return (
      <div className="w-full">
        <Headline title="Products" />
        <div className="mt-8 p-6 bg-white rounded-lg text-red-500">
          Error loading forecasts. Please try again later.
        </div>
      </div>
    );
  }

  const handleTabChange = (value: string | null) => {
    setActiveTab(value);
    const selectedDistributor = distributorData?.data.find(
      (distributor) => distributor.name === value
    );
    if (selectedDistributor) {
      setFilter((prev) => ({
        ...prev,
        distributor_id: selectedDistributor.id.toString(),
      }));
    }
  };
  return (
    <div className="w-full">
      <Headline title={`Forecasting - ${activeTab}`} />
      <section className="mt-3 sm:mt-8">
        <Tabs
          color="#002554"
          className="text-primary"
          value={activeTab}
          onChange={handleTabChange}
        >
          <Tabs.List
            className="flex-nowrap overflow-x-auto whitespace-nowrap flex gap-4 custom-scrollbar"
            style={{ scrollbarWidth: "auto" }} // for Firefox
          >
            {distributorData?.data.map((distributor) => (
              <Tabs.Tab
                key={distributor.id}
                value={distributor.name}
                className="shrink-0"
              >
                {distributor.name}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>

        <ForecastingFilters setFilters={setFilter} />
        <Divider className="my-4 sm:my-6 border-primary border-opacity-50" />
        <ForecastingGraphs filters={filter} />
        {isLoading || !data ? (
          <div className="mt-5 p-6 bg-white rounded-lg flex justify-center">
            <Loader size="md" />
          </div>
        ) : (
          <ForecastingTable
            initialData={data.data.forecast}
            initialMeta={data.meta}
            filters={filter}
          />
        )}
      </section>
    </div>
  );
}
