import DashboardInnovationsTable from "@/components/Distributor-forcasts/dashboardInnovationsTable";
import Headline from "@/components/Shared/Headline";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard-innovations")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Headline title="Innovation forecasts" />
      <DashboardInnovationsTable />
    </div>
  );
}
