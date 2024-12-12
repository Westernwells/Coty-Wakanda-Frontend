import { Title } from "@mantine/core";
import Graphs from "@/assets/placeholderGraph.png"

const ForecastingGraphs = () => {
  return (
    <div className="bg-white w-full rounded-[20px] p-6 mt-5">
      <Title order={2} className="text-primary font-semibold text-xl mb-5">
        1 March 2024 - 31 March 2024
      </Title>
      <img src={Graphs} alt="placeholder graphs" width="100%" />
    </div>
  );
};

export default ForecastingGraphs;
