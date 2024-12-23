import InnovationsForecastsTable from "@/components/Distributor-forcasts/InnovationsForcastsTable";
import Headline from "@/components/Shared/Headline";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/innovation-forecasts")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Headline title="Innovation forecasts" />
      <InnovationsForecastsTable />
    </div>
  );
}
