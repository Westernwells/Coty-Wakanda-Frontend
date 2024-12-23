import ForecastingFilters from "@/components/Forecasting/ForecastingFilters";
import ForecastingGraphs from "@/components/Forecasting/ForecastingGraphs";
import ForecastingTable from "@/components/Forecasting/ForecastingTable";
import Headline from "@/components/Shared/Headline";
import { useUserStore } from "@/stores/userStore";
import { Divider } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";

export const Route = createFileRoute("/_auth/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [filters, setFilters] = useState({
    search: "",
    // startDate: "",
    // endDate: "",
    brand: "",
    pillar: "",
    distributor: "",
    launchId: "",
  });
  const role = useUserStore((state) => state.user?.role);
  return (
    <div className="w-full">
      {role !== "dist" ? (
        <>
          <Headline title="Dashboard" />
          <section className="mt-3 sm:mt-8">
            <ForecastingFilters setFilters={setFilters} />
            <Divider className="my-4 sm:my-6 border-primary border-opacity-50" />
            <ForecastingGraphs />
            <ForecastingTable filters={filters} />
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
