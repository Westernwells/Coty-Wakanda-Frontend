import { getOrders } from "@/api/orders/get-orders";
import OrdersTable from "@/components/Distributor-forcasts/OrdersTable";
import DeadlineHeader from "@/components/DistributorPages/Shared/DeadlineHeader";
import SubmitFooter from "@/components/DistributorPages/Shared/SubmitFooterOrder";
import ErrorCard from "@/components/Shared/ErrorCard";
import Headline from "@/components/Shared/Headline";
import { ForecastSubmitInput } from "@/types";
import { Loader } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_auth/orders")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });
  const form = useForm<{ order: ForecastSubmitInput[] }>();

  useEffect(() => {
    if (data) {
      const transformedData = data.data.order.map((item) => ({
        product_id: item.product.id,
        items: Object.entries(item.items).map(([month, item]) => ({
          month,
          value: item.value,
        })),
      }));

      form.setValues({ order: [...transformedData] });
    }
  }, [data]);

  console.log("Orders data:", data);

  return (
    <div>
      <Headline title="Orders" />
      <DeadlineHeader title="Order Deadline" />
      {isError ? (
        <ErrorCard errorText="an error occured fetching data" />
      ) : isLoading || !data ? (
        <div className="bg-white shadow-md rounded-lg p-6 mt-5">
          <div className="flex justify-center items-center mt-6">
            <Loader />
          </div>
        </div>
      ) : (
        <OrdersTable data={data.data.order} form={form} />
      )}
      <SubmitFooter title="Submit Orders" form={form} />
    </div>
  );
}
