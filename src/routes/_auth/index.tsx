import { useBaseForecasts, useInnovationForecasts } from "@/api/forecasts/get-forcasts";
import ForecastingFilters from "@/components/Forecasting/ForecastingFilters";
import ForecastingGraphs from "@/components/Forecasting/ForecastingGraphs";
import ForecastingTable from "@/components/Forecasting/ForecastingTable";
import Headline from "@/components/Shared/Headline";
import { useLocalFilters } from "@/lib/hooks/useLocalFilters";
import { useUserStore } from "@/stores/userStore";
import { ForecastFilters } from "@/types";
import { Divider, Loader } from "@mantine/core";
import { useForm } from "@mantine/form";
import { createFileRoute } from "@tanstack/react-router";

import { useMemo, useState } from "react";

export const Route = createFileRoute("/_auth/")({
  component: RouteComponent,
});

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
    brand_type: "luxury",
    sort: "",
    type: "",
  });
  const form = useForm<ForecastFilters>({
    initialValues: useMemo(() => {
      return ({
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
      })
    }, []),
    onValuesChange: (values) => {
      setFilters(values);
    }

  });
  const [activeTableTab, setActiveTableTab] = useState<"base" | "innovation">("base");



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

  const role = useUserStore((state) => state.user?.role);
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
  return (
    <div className="w-full">
      {role !== "dist" ? (
        <>
          <Headline title="Dashboard" />
          <section className="mt-3 sm:mt-8">
            <ForecastingFilters form={form} />
            <Divider className="my-4 sm:my-6 border-primary border-opacity-50" />
            <ForecastingGraphs filters={filters} tab={activeTableTab} />
            {(activeTableTab === "base" ? isBaseLoading || !baseData : isInnovationLoading || !innovationData) ? (
              <div className="mt-5 p-6 bg-white rounded-lg flex justify-center">
                <Loader size="md" />
              </div>
            ) : (
              <ForecastingTable
                filters={filters}
                fetchMore={activeTableTab === "innovation" ? fetchInnovationNextPage : fetchNextPage}
                hasMore={activeTableTab === "innovation" ? hasInnovationNextPage || false : hasNextPage || false}
                setFieldValue={form.setFieldValue}
                forecasts={activeTableTab === "innovation" ? innovationData?.pages?.flatMap((page) => page.data.forecast) || [] : baseData?.pages?.flatMap((page) => page.data.forecast) || []}
                activeTab={activeTableTab} setActiveTab={(tab) => {
                  if (!tab) return;
                  setActiveTableTab((prev) => {
                    if (prev === tab) return prev;
                    form.reset();
                    form.setFieldValue("distributor_id", null);
                    form.setFieldValue("brand_type", "")
                    form.setFieldValue("brand_id", null);
                    form.setFieldValue("sub_brand_id", null);
                    return tab;
                  });
                }}
                isLoading={activeTableTab === "innovation" ? isInnovationLoading : isBaseLoading}
                isFetchingNextPage={activeTableTab === "innovation" ? isFetchingInnovationNextPage : isFetchingNextPage}
              />
            )}
          </section>
        </>
      ) : (
        <>
          <div>home admin</div>
        </>
      )}
    </div>
  );
}
