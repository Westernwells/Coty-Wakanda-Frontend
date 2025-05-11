import { Link, createFileRoute } from "@tanstack/react-router";

import AddDistributorForm from "@/components/Distributors/AddDistributorForm";
import { Button } from "@mantine/core";
import ChevronDownIcon from "@/components/Icons/ChevronDownIcon";
import Headline from "@/components/Shared/Headline";
import LoadingSpinner from "@/components/Shared/LoadingSpinner";
import { getDistributor } from "@/api/distributors/get-distributor";
import { useQuery } from "@tanstack/react-query";
import { DistributorHistorySummary } from "@/components/Distributors/DistributorHistorySummary";

export const Route = createFileRoute("/_auth/edit-distributors/$distributorId")(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
  const { distributorId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["distributors", distributorId],
    queryFn: () => getDistributor(distributorId),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full">
      <Headline title="Edit distributor" />
      <section className="mt-3 sm:mt-8">
        <Button
          leftSection={
            <div className="rotate-90">
              <ChevronDownIcon />
            </div>
          }
          variant="default"
          className="border-none bg-transparent   text-primary text-sm font-medium  p-0 before:content-none"
          component={Link}
          to="/distributors"
        >
          Back to Distributors
        </Button>
      </section>
      <AddDistributorForm formData={data?.data} isEdit />
      <DistributorHistorySummary distributorId={distributorId} />
    </div>
  );
}
