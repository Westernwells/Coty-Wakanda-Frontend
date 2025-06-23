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
import { useUserStore } from "@/stores/userStore";
import InnovationsForecastTableDist from "@/components/Distributor-forcasts/InnovationsForecastTableDist";
import { useForecastData } from "@/components/Distributor-forcasts/hooks/use-forecast-data";
import { ForecastDetailsData, ForecastSubmitInput } from "@/types";
import { toast } from "react-toastify";
import { useUpdateInnovationForecasts } from "@/api/innovations/update-innovation-forecasts";
import { updateInnovationForecasts } from "@/api/innovations/update-innovation-forecasts";
import InnovationsForecastTableDistFinished from "@/components/Distributor-forcasts/InnovationForecastTableDistFinished";

export const Route = createFileRoute("/_auth/edit-innovation-forecasts/$forecastId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { forecastId } = Route.useParams();
  const navigate = useNavigate();
  const formRef = useRef<{ submit: () => void; isSubmitting: boolean }>(null);
  const forecastTableRef = useRef<{ submit: () => { forecast: ForecastSubmitInput[] } | null; isSubmitting: boolean }>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["innovations", forecastId],
    queryFn: () => getInnovation(forecastId),
  });

  const { forecastResponse, offeringProducts,offerings } = useForecastData(forecastId);
  const role = useUserStore((state) => state.user)?.role;
  const isDistributor = role === "distributor";
  console.log(role);

  const { mutate: updateInnovation, isPending: isUpdatingInnovation } = useUpdateInnovationForecasts({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Innovation updated successfully!");
      },
      onError: () => {
        toast.error("Error updating innovation!");
      },
    },
  });

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
          to="/innovation-list"
        >
          Back to Innovations
        </Button>
        <div className="flex items-center gap-x-2">
          <Button
            leftSection={<XIcon />}
            onClick={() => {
              navigate({ to: "/innovation-list" });
            }}
            variant="outline"
            className="border-primary  border-s-e rounded-ee-xl text-primary text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            className="border-none w-28 bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
            onClick={() => {
              if (isDistributor) {
                const forecastData = forecastTableRef.current?.submit();
                if (forecastData) {
                  const validForecast = forecastData.forecast.filter(item => {
                    if (!item.product_id || item.product_id <= 0) {
                      return false;
                    }
                    if (!item.items || item.items.length === 0) {
                      return false;
                    }
                    return true;
                  });

                  if (validForecast.length === 0) {
                    toast.error("No valid forecast data to save!");
                    return;
                  }

                  const updateData = {
                    brand_id: data.data.brand.id.toString(),
                    sub_brand_id: data.data.brand_pillar.id.toString(),
                    year: data.data.year,
                    format: data.data.format,
                    launch_name: data.data.launch_name,
                    reference_names: [data.data.launch_ref],
                    status: data.data.status || "active",
                    forecast_deadline: data.data.forecast_deadline,
                    forecast: validForecast
                  };
                  
                    updateInnovationForecasts({ data: updateData, type: "submit" });
                  } else {
                    toast.error("Error saving forecast!");

                }
              } else {
                formRef.current?.submit();
              }
            }}
            loading={isDistributor ? isUpdatingInnovation : formRef.current?.isSubmitting}
            disabled={isDistributor ? isUpdatingInnovation : formRef.current?.isSubmitting}
          >
            {(isDistributor ? isUpdatingInnovation : formRef.current?.isSubmitting) ? "Saving..." : "Save"}
          </Button>
        </div>
      </section>
      {isDistributor ? (
        <InnovationsForecastTableDist
          ref={forecastTableRef}
          data={forecastResponse?.data as ForecastDetailsData}
          offeringProducts={offeringProducts}
          offerings={offerings}
          />
      ) : (
        <InnovationsForecastTableDistFinished
        ref={forecastTableRef}
        data={forecastResponse?.data as ForecastDetailsData}
        offeringProducts={offeringProducts}
        offerings={offerings}
        />
      )}
    </div>
  );
}