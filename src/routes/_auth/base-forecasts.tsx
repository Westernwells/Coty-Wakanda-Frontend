import { getForecasts } from "@/api/forecasts/get-forcasts";
import BaseForecastsTable from "@/components/Distributor-forcasts/BaseForcastsTable";
import DeadlineHeader from "@/components/DistributorPages/Shared/DeadlineHeader";
import SubmitFooter from "@/components/DistributorPages/Shared/SubmitFooterBaseForecast";
import ErrorCard from "@/components/Shared/ErrorCard";
import Headline from "@/components/Shared/Headline";
import { ForecastSubmitInput } from "@/types";
import { Loader } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/base-forecasts")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["base-forcasts"],
    queryFn: () => getForecasts({ cursor: 1, page_size: 20 }),
  });
  const form = useForm<{ forecast: ForecastSubmitInput[] }>();

  return (
    <div>
      <Headline title="Base forecasts" />
      <DeadlineHeader title="Forecast Deadline" />
      {isError ? (
        <ErrorCard errorText="an error occured fetching data" />
      ) : isLoading || !data ? (
        <div className="bg-white shadow-md rounded-lg p-6 mt-5">
          <div className="flex justify-center items-center mt-6">
            <Loader />
          </div>
        </div>
      ) : (
        <BaseForecastsTable
          initialData={data.data.forecast}
          initialMeta={data.meta}
          form={form}
        />
      )}

      <SubmitFooter title="Submit Forecast" form={form} />
    </div>
  );
}
