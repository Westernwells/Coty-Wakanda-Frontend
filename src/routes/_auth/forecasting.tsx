import { createFileRoute } from "@tanstack/react-router";
import { Divider, Loader, Tabs } from "@mantine/core";
import Headline from "@/components/Shared/Headline";
import { useState } from "react";
import ForecastingFilters from "@/components/Forecasting/ForecastingFilters";
import ForecastingTable from "@/components/Forecasting/ForecastingTable";
import ForecastingGraphs from "@/components/Forecasting/ForecastingGraphs";
import { useQuery } from "@tanstack/react-query";
import { getForecasts } from "@/api/forecasts/get-forcasts";
import { ForecastFilters } from "@/types";

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
    const [activeTab, setActiveTab] = useState<string | null>("Total");
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
            <Headline title={`Forecasting - ${activeTab}`} />
            <section className="mt-3 sm:mt-8">
                <Tabs
                    color="#002554"
                    className="text-primary"
                    value={activeTab}
                    onChange={setActiveTab}
                >
                    <Tabs.List className="before:border-0">
                        <Tabs.Tab value="Total">Total</Tabs.Tab>
                        <Tabs.Tab value="OLKA">OLKA</Tabs.Tab>
                        <Tabs.Tab value="SATEM">SATEM</Tabs.Tab>
                        <Tabs.Tab value="MFC">MFC</Tabs.Tab>
                        <Tabs.Tab value="DOM">DOM</Tabs.Tab>
                        <Tabs.Tab value="IAM">IAM</Tabs.Tab>
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
