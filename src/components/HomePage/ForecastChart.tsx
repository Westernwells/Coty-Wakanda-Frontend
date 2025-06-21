import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "@mantine/core";
import { LineChart } from "@mantine/charts";

import { getForecastChart, getInnovationForecastChart } from "@/api/forecasts/get-forecast-chart";
import type { ForecastFilters } from "@/types";

interface ForecastChartProps {
  filters?: ForecastFilters;
  tab: "base" | "innovation";
  forecastPeriods?: (periods: { start: string; end: string }) => { start: string; end: string };
}

const ForecastChart: React.FC<ForecastChartProps> = ({ filters, tab = "base", forecastPeriods }) => {
  const {
    data: baseResponse,
    isLoading: baseLoading,
  } = useQuery({
    queryKey: ["forecast-chart", "base", filters],
    queryFn: () => getForecastChart({ filter: filters }),
    enabled: tab === "base",
  });

  const {
    data: invResponse,
    isLoading: invLoading,
  } = useQuery({
    queryKey: ["forecast-chart", "innovation", filters],
    queryFn: () => getInnovationForecastChart({ filter: filters }),
    enabled: tab === "innovation",
  });

  const { chart, isLoading } = useMemo(() => {
    if (tab === "innovation") {
      return { chart: invResponse?.data?.chart, isLoading: invLoading };
    }
    return { chart: baseResponse?.data?.chart, isLoading: baseLoading };
  }, [tab, baseResponse, invResponse, baseLoading, invLoading]);


  const { unitData, valueData } = useMemo(() => {
    if (!chart) {
      return { unitData: [], valueData: [] };
    }
    const { total_unit = {}, total_value = {} } = chart;
    const unitData = Object.entries(total_unit).map(([date, units]) => ({ date, units }));
    const valueData = Object.entries(total_value).map(([date, value]) => ({ date, value }));
    return { unitData, valueData };
  }, [chart]);

if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }
  
  if (unitData.length === 0 && valueData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        No forecast data available for these filters.
      </div>
    );
  }
  
  if(!isLoading && (unitData.length === 0 || valueData.length === 0)) {
      forecastPeriods?.({ start: "", end: "" });
      return null;
  }
if(unitData && unitData.length> 0){
  forecastPeriods?.({
    start: unitData[0].date,  
    end: unitData[unitData.length - 1].date,
  });
}

  
  return (
    <div className="flex flex-wrap justify-between gap-4 grow mb-5 font-semibold text-primary">
      <div className="grow p-5">
        <p className="text-lg pb-5">Total unit forecast</p>
        <LineChart
          h={300}
          data={unitData}
          series={[{ name: "units", label: "Units Sold" }]}
          dataKey="date"
        />
      </div>
      <div className="grow p-5">
        <p className="text-lg pb-5">Total value forecast ($)</p>
        <LineChart
          h={300}
          data={valueData}
          series={[{ name: "value", label: "Profit Made" }]}
          dataKey="date"
        />
      </div>
    </div>
  );
};

export default ForecastChart;