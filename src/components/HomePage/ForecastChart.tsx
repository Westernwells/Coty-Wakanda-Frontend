import { getForecastChart } from "@/api/forecasts/get-forecast-chart";
import { ForecastFilters } from "@/types";
import { LineChart } from "@mantine/charts";
import { Loader } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const ForecastChart = ({ filters }: { filters?: ForecastFilters }) => {
    const { data, isLoading } = useQuery({
        queryKey: ["admin-chart", filters],
        queryFn: () => getForecastChart({ filter: filters }),
    });

    const [unitData, setUnitData] = useState<
        { date: string; units: number }[] | null
    >(null);
    const [valueData, setValueData] = useState<
        { date: string; value: number }[] | null
    >(null);
    useEffect(() => {
        if (data && !isLoading) {
            const totalUnit = data?.data?.chart?.total_unit;
            const totalValue = data?.data?.chart?.total_value;

            const unitData = totalUnit
                ? Object.entries(totalUnit).map(([date, units]) => ({
                      date,
                      units,
                  }))
                : [];

            const valueData = totalValue
                ? Object.entries(totalValue).map(([date, value]) => ({
                      date,
                      value,
                  }))
                : [];

            setUnitData(unitData);
            setValueData(valueData);
        }
    }, [isLoading, data]);

    if (isLoading || !unitData || !valueData) {
        return <Loader />;
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
