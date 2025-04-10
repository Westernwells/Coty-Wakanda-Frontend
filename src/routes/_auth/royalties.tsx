import RoyaltiesTable from "@/components/Royalties/RoyaltiesTable";
import Headline from "@/components/Shared/Headline";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/royalties")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full">
      <Headline title="Royalties" />
      <section className="mt-3 sm:mt-8">
        <RoyaltiesTable />
      </section>
    </div>
  );
}
