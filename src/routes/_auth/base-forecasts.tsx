import BaseForecastsTable from "@/components/Distributor-forcasts/BaseForcastsTable";
import SubmitFooter from "@/components/DistributorPages/Shared/SubmitFooterBaseForecast";
import DeadlineHeader from "@/components/DistributorPages/Shared/DeadlineHeader";
import Headline from "@/components/Shared/Headline";
import { createFileRoute } from "@tanstack/react-router";
import { getForecasts } from "@/api/forecasts/get-forcasts";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { ForecastSubmitInput } from "@/types";
import ErrorCard from "@/components/Shared/ErrorCard";
import { Loader } from "@mantine/core";

export const Route = createFileRoute("/_auth/base-forecasts")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["base-forcasts"],
    queryFn: getForecasts,
  });
  const form = useForm<{forecast: ForecastSubmitInput[]}>();

  useEffect(() => {
    if (data) {
      const transformedData = data.data.forecast.map((item) => ({
        product_id: item.product.id,
        items: Object.entries(item.items).map(([month, item]) => ({
          month,
          value: item.value,
        })),
      }));

      form.setValues({forecast: [...transformedData]});
    }
  }, [data]);

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
        <BaseForecastsTable data={data.data.forecast} form={form} />
      )}

      <SubmitFooter title="Submit Forecast" form={form} />
    </div>
  );
}
