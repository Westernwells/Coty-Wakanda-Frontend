import { getDistributors } from "@/api/distributors/get-distributors";
import { useBaseForecasts, useInnovationForecasts } from "@/api/forecasts/get-forcasts";
import ForecastingFilters from "@/components/Forecasting/ForecastingFilters";
import ForecastingGraphs from "@/components/Forecasting/ForecastingGraphs";
import ForecastingTable from "@/components/Forecasting/ForecastingTable";
import Headline from "@/components/Shared/Headline";
import { useLocalFilters } from "@/lib/hooks/useLocalFilters";
import { ForecastFilters } from "@/types";
import { Divider, Tabs } from "@mantine/core";
import { useForm } from "@mantine/form";
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
export type FieldValue = {
  search: string;
  start_date: string;
  end_date: string;
  launch_id: string;
  brand_id: string | null;
  sub_brand_id: string | null;
  distributor_id: string | null;
  brand_type: string;
}
function RouteComponent() {
  const storageKey = `filters:${window.location.pathname}`;
  const [filters, setFilters] = useLocalFilters<ForecastFilters>(storageKey, {
    search: "",
    start_date: "",
    end_date: "",
    launch_id: "",
    brand_id: "",
    sub_brand_id: "",
    distributor_id: "",
    brand_type: "",
    sort: "",
    type: "",
  });
  const form = useForm<ForecastFilters>({
    initialValues: {
      search: filters.search || "",
      start_date: filters.start_date || "",
      end_date: filters.end_date || "",
      launch_id: filters.launch_id || "",
      brand_id: filters.brand_id || "",
      sub_brand_id: filters.sub_brand_id || "",
      distributor_id: filters.distributor_id || "",
      brand_type: filters.brand_type || "",
      sort: filters.sort || "",
      type: filters.type || "",
    },
    onValuesChange: (values) => {
      setFilters(values);
    }
  });
  const [activeTableTab, setActiveTableTab] = useState<"base" | "innovation">("base");

  const { data: distributorData, isLoading: isDistributorsLoading, error: isDistributorError } = useQuery({
    queryKey: ["distributors"],
    queryFn: () => getDistributors({ page_size: 100 }),
  });

  const activeDistributor = useMemo(() => {

    const distn = distributorData?.data.find(
      (distributor) => distributor.id == filters?.distributor_id
    )
    return distn?.name || "ALL";

  }, [distributorData, filters?.distributor_id]);

  const {
    data: baseData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isBaseLoading,
    error: baseError,
  } = useBaseForecasts({
    searchQuery: filters.search,
    brand_id: filters.brand_id ?? undefined,
    sub_brand_id: filters.sub_brand_id ?? undefined,
    distributor_id: filters.distributor_id ?? undefined,
    brand_type: filters.brand_type,
    launch_id: filters.launch_id,
    start_date: filters.start_date,
    end_date: filters.end_date,
    pageSize: 20,
    type: filters.type,
    sort: filters.sort ?? undefined,
  }, {
    enabled: activeTableTab === "base",

  });
  const {
    data: innovationData,
    fetchNextPage: fetchInnovationNextPage,
    hasNextPage: hasInnovationNextPage,
    isFetchingNextPage: isFetchingInnovationNextPage,
    isLoading: isInnovationLoading,
    error: innovationError,
  } = useInnovationForecasts({
    searchQuery: filters.search,
    brand_id: filters.brand_id ?? undefined,
    sub_brand_id: filters.sub_brand_id ?? undefined,
    distributor_id: filters.distributor_id ?? undefined,
    brand_type: filters.brand_type,
    launch_id: filters.launch_id,
    start_date: filters.start_date,
    end_date: filters.end_date,
    pageSize: 20,
    type: filters.type,
    sort: filters.sort ?? undefined,
  }, {

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
  // TODO: enable this back after Goke fixes the API
  // if (activeTableTab === "base" ? baseError || (!isBaseLoading && !baseData) : innovationError || (!isInnovationLoading && !innovationData)) {
  //   return (
  //     <div className="w-full">
  //       <Headline title="Products" />
  //       <div className="mt-8 p-6 bg-white rounded-lg text-red-500">
  //         Error loading forecasts. Please try again later.
  //       </div>
  //     </div>
  //   );
  // }
  const handleTabChange = (value: string | null) => {
    if (!value) return;
    if (value === "ALL") {
      form.setFieldValue("distributor_id", null);
    } else {

      const selectedDistributor = distributorData?.data.find(
        (distributor) => distributor.name === value
      );
      if (selectedDistributor) {
        form.setFieldValue("distributor_id", selectedDistributor.id.toString());
      }
    };
  }

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
            {distributorData?.data && (
              [{ id: "ALL", name: "ALL" }, ...distributorData.data].map((distributor) => (
                <Tabs.Tab
                  key={distributor.id}
                  value={distributor.name}
                  className="shrink-0"
                >
                  {distributor.name}
                </Tabs.Tab>
              ))
            )}
          </Tabs.List>
        </Tabs>

        <ForecastingFilters form={form} />
        <Divider className="my-4 sm:my-6 border-primary border-opacity-50" />
        <ForecastingGraphs filters={filters} tab={activeTableTab} />
        <>
          <ForecastingTable
            filters={filters}
            fetchMore={activeTableTab === "innovation" ? fetchInnovationNextPage : fetchNextPage}
            hasMore={activeTableTab === "innovation" ? hasInnovationNextPage || false : hasNextPage || false}
            setFieldValue={form.setFieldValue}
            forecasts={activeTableTab === "innovation" ? innovationData?.pages.flatMap((page) => page.data.forecast) || [] : baseData?.pages.flatMap((page) => page.data.forecast) || []}
            activeTab={activeTableTab} setActiveTab={(tab) => {
              if (!tab) return;
              setActiveTableTab((prev) => {
                if (prev === tab) return prev;
                form.reset();
                form.setFieldValue("distributor_id", null);
                form.setFieldValue("brand_type", "")
                form.setFieldValue("brand_id", null);
                form.setFieldValue("sub_brand_id", null);
                form.setFieldValue("type", "all");
                form.setFieldValue("sort", null);
                return tab;
              });
            }}
            isLoading={activeTableTab === "innovation" ? isInnovationLoading : isBaseLoading}
            isFetchingNextPage={activeTableTab === "innovation" ? isFetchingInnovationNextPage : isFetchingNextPage}
          />
        </>
      </section>
    </div>
  );
}





