import BaseForecastsTable from "@/components/Distributor-forcasts/BaseForcastsTable";
import SubmitFooter from "@/components/DistributorPages/Shared/SubmitFooter";
import DeadlineHeader from "@/components/DistributorPages/Shared/DeadlineHeader";
import Headline from "@/components/Shared/Headline";
import { createFileRoute } from "@tanstack/react-router";
import { getForecasts } from "@/api/forecasts/get-forcasts";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { ForecastSubmitInput } from "@/types";

export const Route = createFileRoute("/_auth/base-forecasts")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useQuery({
    queryKey: ["base-forcasts"],
    queryFn: getForecasts,
  });
  const form = useForm<ForecastSubmitInput[]>();

  useEffect(() => {
    if (data) {
      const transformedData = data.data.forecast.map((item) => ({
        product_id: item.product.id,
        items: Object.entries(item.items).map(([month, item]) => ({
          month,
          value: item.value,
        })),
      }));

      form.setValues([...transformedData]);
      console.log(form.getValues());
    }
  }, [data]);

  return (
    <div>
      <Headline title="Base forecasts" />
      <DeadlineHeader title="Forecast Deadline" />
      <BaseForecastsTable data={data?.data.forecast} form={form} />
      <SubmitFooter title="Submit Forecast" form={form} />
    </div>
  );
}
