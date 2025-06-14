import { getDistributors } from "@/api/distributors/get-distributors";
import { useBaseForecasts, useInnovationForecasts } from "@/api/forecasts/get-forcasts";
import ForecastingFilters from "@/components/Forecasting/ForecastingFilters";
import ForecastingGraphs from "@/components/Forecasting/ForecastingGraphs";
import ForecastingTable from "@/components/Forecasting/ForecastingTable";
import Headline from "@/components/Shared/Headline";
import { ForecastFilters } from "@/types";
import { Divider, Tabs } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_auth/forecasting")({
  component: RouteComponent,
});
export type Forecast = {
  product: {
    id: number;
    brand: { name: string };
    brand_pillar: { name: string };
    sku: string;
    launch_id: number | null;
    offering_number: string | null;
  };
  distributor?: { name: string };
  items: Record<string, { value: number; is_closed: boolean }>;
};
function RouteComponent() {
  const [activeTableTab, setActiveTableTab] = useState<string>("base");

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
  const { data: distributorData, isLoading: isDistributorsLoading, error: isDistributorError } = useQuery({
    queryKey: ["distributors"],
    queryFn: () => getDistributors({ page_size: 100 }),
  });
  const [activeTab, setActiveTab] = useState<string | null>("Total");
  const activeDistributor = useMemo(()=>{
     
    const distn = distributorData?.data.find(
    (distributor) => distributor.id == filter?.distributor_id
  )
  return distn?.name || "Total";

}, [distributorData, filter?.distributor_id]);

  const {
    data: baseData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isBaseLoading,
  } = useBaseForecasts({
    searchQuery: filter.search,
    brand_id: filter.brand_id,
    sub_brand_id: filter.sub_brand_id,
    distributor_id: filter.distributor_id,
    brand_type: filter.brand_type,
    launch_id: filter.launch_id,
    start_date: filter.start_date,
    end_date: filter.end_date,
    pageSize: 2,
    type: filter.type,
    sort: filter.sort,
  },{
    enabled: activeTableTab === "base",
  });
  const {
    data: innovationData,
    fetchNextPage: fetchInnovationNextPage,
    hasNextPage: hasInnovationNextPage,
    isFetchingNextPage: isFetchingInnovationNextPage,
    isLoading: isInnovationLoading,
  } = useInnovationForecasts({
    searchQuery: filter.search,
    brand_id: filter.brand_id,
    sub_brand_id: filter.sub_brand_id,
    distributor_id: filter.distributor_id,
    brand_type: filter.brand_type,
    launch_id: filter.launch_id,
    start_date: filter.start_date,
    end_date: filter.end_date,
    pageSize: 2,
    type: filter.type,
    sort: filter.sort,
  },{
   
    enabled: activeTableTab === "innovation",
  });



  if (isDistributorError && (!isDistributorsLoading)) {
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
      <Headline title={`Forecasting - ${activeDistributor}`} />
      <section className="mt-3 sm:mt-8">
        <Tabs
          color="#002554"
          className="text-primary"
          value={activeDistributor}
          onChange={handleTabChange}
        >
          <Tabs.List
            className="flex-nowrap overflow-x-auto whitespace-nowrap flex gap-4 custom-scrollbar"
            style={{ scrollbarWidth: "auto" }} 
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

        <ForecastingFilters setFilters={setFilter} filters={filter} />
        <Divider className="my-4 sm:my-6 border-primary border-opacity-50" />
        <ForecastingGraphs filters={filter} tab={activeTableTab} />
          <>
          <ForecastingTable
            filters={filter}
            fetchMore={activeTableTab === "innovation" ? fetchInnovationNextPage : fetchNextPage}
            hasMore={activeTableTab === "innovation" ? hasInnovationNextPage || false: hasNextPage || false}
            setFilters={setFilter}
            forecasts={activeTableTab === "innovation" ? innovationData?.pages.flatMap((page) => page.data.forecast) || [] : baseData?.pages.flatMap((page) => page.data.forecast) || []}
            activeTab={activeTableTab} setActiveTab={(tab)=>{
              setFilter({ search: "",
                start_date: "",
                end_date: "",
                launch_id: "",
                brand_id: "",
                sub_brand_id: "",
                distributor_id: "",
                brand_type: "",
                type: "",
                sort: "",
               });
              setActiveTableTab(tab);
            }} 
            isLoading={activeTableTab === "innovation"  ? isInnovationLoading : isBaseLoading}
            isFetchingNextPage={activeTableTab === "innovation" ? isFetchingInnovationNextPage : isFetchingNextPage}
            />
            </>
      </section>
    </div>
  );
}





