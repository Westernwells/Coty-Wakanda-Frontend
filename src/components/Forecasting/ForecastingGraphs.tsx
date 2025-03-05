import { Title } from "@mantine/core";
import ForecastChart from "../HomePage/ForecastChart";
import { ForecastFilters } from "@/types";

const ForecastingGraphs = ({ filters }: { filters?: ForecastFilters }) => {
  return (
    <div className="bg-white w-full rounded-[20px] p-6 mt-5">
      <Title order={2} className="text-primary font-semibold text-xl mb-5">
        1 March 2024 - 31 March 2024
      </Title>
      <ForecastChart filters={filters} />
    </div>
  );
};

export default ForecastingGraphs;
