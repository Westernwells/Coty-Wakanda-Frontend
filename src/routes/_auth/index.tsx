import { getForecasts } from "@/api/forecasts/get-forcasts";
import ForecastingFilters from "@/components/Forecasting/ForecastingFilters";
import ForecastingGraphs from "@/components/Forecasting/ForecastingGraphs";
import ForecastingTable from "@/components/Forecasting/ForecastingTable";
import Headline from "@/components/Shared/Headline";
import { useUserStore } from "@/stores/userStore";
import { ForecastFilters } from "@/types";
import { Divider, Loader } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";

export const Route = createFileRoute("/_auth/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [filters, setFilters] = useState<ForecastFilters>({
    search: "",
    startDate: "",
    endDate: "",
    brand: "",
    brandPillar: "",
    distributor: "",
    launchId: "",
    brandType: "",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["forecasts", filters], // ✅ Filters trigger refetch
    queryFn: () =>
      getForecasts({
        cursor: 1,
        page_size: 20,
        filters,
      }),
  });
  const role = useUserStore((state) => state.user?.role);
  if (error || (!isLoading && !data)) {
    return (
      <div className="w-full">
        <Headline title="Products" />
        <div className="mt-8 p-6 bg-white rounded-lg text-red-500">
          Error loading forecasts. Please try again later.
        </div>
      </div>
    );
  }
  return (
    <div className="w-full">
      {role !== "dist" ? (
        <>
          <Headline title="Dashboard" />
          <section className="mt-3 sm:mt-8">
            <ForecastingFilters setFilters={setFilters} />
            <Divider className="my-4 sm:my-6 border-primary border-opacity-50" />
            <ForecastingGraphs filters={filters} />
            {isLoading || !data ? (
              <div className="mt-5 p-6 bg-white rounded-lg flex justify-center">
                <Loader size="md" />
              </div>
            ) : (
              <ForecastingTable
                initialData={data.data.forecast}
                initialMeta={data.meta}
                filters={filters}
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
