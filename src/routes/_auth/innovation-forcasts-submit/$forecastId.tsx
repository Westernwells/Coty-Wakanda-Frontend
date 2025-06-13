import FileDownloadIcon from "@/components/Icons/FileDownloadIcon";
import PlusIcon from "@/components/Icons/PlusIcon";
import SubmitModal from "@/components/Distributor-forcasts/SubmitModal";
import SubmitTable from "@/components/Distributor-forcasts/SubmitTable";
import { FormSection } from "@/components/Shared/Form/Section";
import Headline from "@/components/Shared/Headline";
import InfoCard from "@/components/Shared/InfoCard";
import { Button, Grid, Group, Radio } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useForecastTransform } from "@/components/Distributor-forcasts/hooks/use-forecast-transform";
import { formatDate } from "@/utils/date";
import { useForecastData } from "@/components/Distributor-forcasts/hooks/use-forecast-data";

export const Route = createFileRoute("/_auth/innovation-forcasts-submit/$forecastId")({
  component: RouteComponent,
});

function RouteComponent() {
  const [opened, { open, close }] = useDisclosure(false);
  const params = useParams({ from: "/_auth/innovation-forcasts-submit/$forecastId" });
  const [selectedType, setSelectedType] = useState<string>("all");

  const {
    forecastResponse,
    offerings,
    offeringProducts,
    isLoading,
    error
  } = useForecastData(params.forecastId);

  const {
    months,
    transformedForecasts
  } = useForecastTransform(
    offerings,
    offeringProducts,
    forecastResponse?.data,
    selectedType
  );

  if (isLoading) return <div>Loading...</div>

  if (error) return <div>Error loading forecast details</div>

  return (
    <div className="w-full">
      <Headline title={forecastResponse?.data?.product?.offering_number?.toString() || 'Forecast Details'} />
      <FormSection title="Forecast Details" className="mt-2 sm:mt-5">
        <Grid>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <Radio.Group
              name="type"
              value={selectedType}
              onChange={setSelectedType}
            >
              <Group
                gap={24}
                w="100%"
                className="mt-[10px] flex-col sm:flex-row items-start"
              >
                <Radio
                  value="all"
                  label="All"
                  classNames={{
                    label: "text-primary text-sm pl-[5px] sm:pl-2",
                  }}
                />
                <Radio
                  value="saleable"
                  label="Saleable"
                  classNames={{
                    label: "text-primary text-sm pl-[5px] sm:pl-2",
                  }}
                />
                <Radio
                  value="non-saleable"
                  label="Non-saleable"
                  classNames={{
                    label: "text-primary text-sm pl-[5px] sm:pl-2",
                  }}
                />
              </Group>
            </Radio.Group>
          </Grid.Col>
          <Grid.Col
            span={{
              base: 12,
            }}
          >
            <InfoCard
              title="Forecast deadline"
              data={forecastResponse?.data?.forecast_deadline ? formatDate(forecastResponse.data.forecast_deadline) : 'N/A'}
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      {transformedForecasts.map((forecast, index) => (
        <div key={index} className="mb-4">
          <SubmitTable
            title={`Offering ${forecast.offeringNumber}`}
            forecast={forecast.data}
            months={months}
          />
        </div>
      ))}

      <Group justify="flex-end" mt="xl" gap={10}>
        <Button
          variant="outline"
          className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
          leftSection={<FileDownloadIcon />}
          onClick={() => { }}
        >
          Save
        </Button>
        <Button
          leftSection={<PlusIcon />}
          type="submit"
          variant="outline"
          className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
          onClick={() => open()}
        >
          Submit
        </Button>
      </Group>

      <SubmitModal opened={opened} close={close} />
    </div>
  );
}
