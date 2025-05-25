import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";

import EditInnovationForm from "@/components/AddInnovation/EditInnovationForm";
import { Button } from "@mantine/core";
import ChevronDownIcon from "@/components/Icons/ChevronDownIcon";
import { XIcon } from "lucide-react";
import Headline from "@/components/Shared/Headline";
import { useQuery } from "@tanstack/react-query";
import { getInnovation } from "@/api/innovations/get-innovation";
import LoadingSpinner from "@/components/Shared/LoadingSpinner";

export const Route = createFileRoute("/_auth/edit-innovation/$innovationId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { innovationId } = Route.useParams();
  const navigate = useNavigate();
  const formRef = useRef<{ submit: () => void; isSubmitting: boolean }>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["innovations", innovationId],
    queryFn: () => getInnovation(innovationId),
  });

  console.log({ innovationById: data?.data });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!data?.data) {
    return <div>Innovation not found</div>;
  }

  return (
    <div className="w-full">
      <Headline title="Edit innovation" />
      <div className="mt-2 text-sm text-gray-500">
        <div className="flex items-center gap-x-2">
          <span className="text-primary font-bold">Launch ID:</span>
          <span className="text-gray-700 truncate">{data.data.launch_id}</span>
        </div>
        <div className="flex items-center gap-x-2">
          <span className="text-primary font-bold">Launch Reference:</span>
          <span className="text-gray-700">{data.data.launch_ref}</span>
        </div>
      </div>
      <section className="mt-3 sm:mt-8 flex justify-between items-center">
        <Button
          leftSection={
            <div className="rotate-90">
              <ChevronDownIcon />
            </div>
          }
          variant="default"
          className="border-none bg-transparent   text-primary text-sm font-medium  p-0 before:content-none"
          component={Link}
          to="/innovations"
        >
          Back to Innovations
        </Button>
        <div className="flex items-center gap-x-2">
          <Button
            leftSection={<XIcon />}
            onClick={() => {
              navigate({ to: "/innovations" });
            }}
            variant="outline"
            className="border-primary  border-s-e rounded-ee-xl text-primary text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            className="border-none w-28 bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
            onClick={() => formRef.current?.submit()}
            loading={formRef.current?.isSubmitting}
            disabled={formRef.current?.isSubmitting}
          >
            {formRef.current?.isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </section>
      <EditInnovationForm
        ref={formRef}
        innovationData={data.data}
        innovationId={innovationId}
      />
    </div>
  );
}
