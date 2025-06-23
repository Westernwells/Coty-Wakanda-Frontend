import { Card, Stack, Text } from "@mantine/core";
import { ForecastData, ForecastDetailsData, ForecastSubmitInput } from "@/types";
import { ForecastTable } from "./ForecastTable";
import { UseFormReturnType } from "@mantine/form";
import { Offering } from "../../AddInnovation/Offering/types";
import DateSwitch from "../DateSwitch";

interface OfferingTableProps {
  offeringId: string;
  offeringForecasts: ForecastData[];
  data: ForecastDetailsData;
  form: UseFormReturnType<{ forecast: ForecastSubmitInput[] }>;
  forecastsByOffering: Record<string, ForecastData[]>;
  offerings: Offering[];
  status: boolean;
}

export const OfferingTable = ({ 
  offeringId, 
  offeringForecasts, 
  data, 
  form, 
  forecastsByOffering,
  offerings,
  status
}: OfferingTableProps) => {
  const offering = offerings.find(o => o.id === Number(offeringId));
  const offeringNumber = offering?.number || offeringId;

  return (
    <Card className="mb-6 mt-10" shadow="sm" padding="lg">
      <Stack gap="md">
        <div className="flex justify-between items-center">
          <Text size="lg" fw={600} c="primary">
            Offering {offeringNumber}
          </Text>
          <DateSwitch />
        </div>
        
        {offeringForecasts.length === 0 ? (
          <div className="text-center py-8 ">
            <Text c="dimmed" size="md">
              No data to display
            </Text>
          </div>
        ) : (
          <ForecastTable 
            offeringForecasts={offeringForecasts}
            data={data}
            form={form}
            forecastsByOffering={forecastsByOffering}
            offeringId={offeringId} 
            status={status}
          />
        )}
      </Stack>
    </Card>
  );
} 