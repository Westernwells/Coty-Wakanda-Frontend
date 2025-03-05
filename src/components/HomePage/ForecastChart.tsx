import { getForecastChart } from "@/api/forecasts/get-forecast-chart";
import { useQuery } from "@tanstack/react-query";
import { LineChart } from "@mantine/charts";
import { useEffect, useState } from "react";
import { Loader } from "@mantine/core";
import { ForecastFilters } from "@/types";

const ForecastChart = ({ filters }: { filters?: ForecastFilters }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-chart"],
    queryFn: () => getForecastChart({ filters: filters }),
  });

  const [unitData, setUnitData] = useState<
    { date: string; units: number }[] | null
  >(null);
  const [valueData, setValueData] = useState<
    { date: string; value: number }[] | null
  >(null);
  useEffect(() => {
    if (data && !isLoading) {
      const unitData = Object.entries(data?.data.chart.total_unit).map(
        (key) => {
          return { date: key[0], units: key[1] };
        }
      );
      const valueData = Object.entries(data?.data.chart.total_value).map(
        (key) => {
          return { date: key[0], value: key[1] };
        }
      );
      setUnitData(unitData);
      setValueData(valueData);
    }
  }, [isLoading, data]);

  if (isLoading || !unitData || !valueData) {
    return <Loader />;
  }

  return (
    <div className="flex justify-between gap-4 grow mb-5 font-semibold text-primary">
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
