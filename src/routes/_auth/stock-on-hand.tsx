import { getForecasts } from "@/api/forecasts/get-forcasts";
import BaseForecastsTable from "@/components/Distributor-forcasts/BaseForcastsTable";
import DeadlineHeader from "@/components/DistributorPages/Shared/DeadlineHeader";
import SubmitFooter from "@/components/DistributorPages/Shared/SubmitFooter";
import Headline from "@/components/Shared/Headline";
import { ForecastSubmitInput } from "@/types";
import { useForm } from "@mantine/form";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/stock-on-hand")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useQuery({
    queryKey: ["base-forcasts"],
    queryFn: getForecasts,
  });
  const form = useForm<ForecastSubmitInput[]>();
  return (
    <div>
      <Headline title="Stock on hand" />
      <DeadlineHeader title="Forecast Deadline" />
      <BaseForecastsTable
        showDateChanger={true}
        data={data?.data.forecast}
        form={form}
      />
      <SubmitFooter title="Submit Sales" form={form} />
    </div>
  );
}
