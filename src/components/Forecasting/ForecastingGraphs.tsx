import { Title } from "@mantine/core";
import ForecastChart from "../HomePage/ForecastChart";
import { ForecastFilters } from "@/types";
import { useState } from "react";

const ForecastingGraphs = ({ filters, tab }: { filters?: ForecastFilters, tab: "base" | "innovation" }) => {
  const [forecastPeriod, setForecastPeriod] = useState("");
  return (
    <div className="bg-white w-full rounded-[20px] p-6 mt-5">
      <Title order={2} className="text-primary font-semibold text-xl mb-5">
       {forecastPeriod}
      </Title>
      <ForecastChart filters={filters} tab={tab} forecastPeriods={(periods)=>{
        if (periods.start && periods.end) {
          setForecastPeriod(`${periods.start} - ${periods.end}`);
        }
        else{
          setForecastPeriod("");
        }
        return periods;
      }} />
    </div>  
  );
};

export default ForecastingGraphs;
