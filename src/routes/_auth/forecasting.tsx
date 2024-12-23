import { createFileRoute } from "@tanstack/react-router";
import { Divider, Tabs } from "@mantine/core";
import Headline from "@/components/Shared/Headline";
import { useState } from "react";
import ForecastingFilters from "@/components/Forecasting/ForecastingFilters";
import ForecastingTable from "@/components/Forecasting/ForecastingTable";
import ForecastingGraphs from "@/components/Forecasting/ForecastingGraphs";

export const Route = createFileRoute("/_auth/forecasting")({
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
  const [activeTab, setActiveTab] = useState<string | null>('Total');
  return (
    <div className="w-full">
      <Headline title={`Forecasting - ${activeTab}`} />
      <section className="mt-3 sm:mt-8">
        <Tabs color="#002554" className="text-primary" value={activeTab} onChange={setActiveTab}>
          <Tabs.List className="before:border-0">
            <Tabs.Tab value="Total" >Total</Tabs.Tab>
            <Tabs.Tab value="OLKA">OLKA</Tabs.Tab>
            <Tabs.Tab value="SATEM">SATEM</Tabs.Tab>
            <Tabs.Tab value="MFC">MFC</Tabs.Tab>
            <Tabs.Tab value="DOM">DOM</Tabs.Tab>
            <Tabs.Tab value="IAM">IAM</Tabs.Tab>
          </Tabs.List>
        </Tabs>
        <ForecastingFilters setFilters={setFilters} />
        <Divider className="my-4 sm:my-6 border-primary border-opacity-50" />
        <ForecastingGraphs />
        <ForecastingTable filters={filters} />
      </section>
    </div>
  );
}
