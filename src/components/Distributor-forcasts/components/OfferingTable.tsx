import { Card, Stack, Text } from "@mantine/core";
import { ForecastData, ForecastDetailsData, ForecastSubmitInput } from "@/types";
import { ForecastTable } from "./ForecastTable";
import { UseFormReturnType } from "@mantine/form";

interface OfferingTableProps {
  offeringId: string;
  offeringForecasts: ForecastData[];
  data: ForecastDetailsData;
  form: UseFormReturnType<{ forecast: ForecastSubmitInput[] }>;
  forecastsByOffering: Record<string, ForecastData[]>;
}

export const OfferingTable = ({ 
  offeringId, 
  offeringForecasts, 
  data, 
  form, 
  forecastsByOffering 
}: OfferingTableProps) => (
  <Card className="mb-6" shadow="sm" padding="lg">
    <Stack gap="md">
      <Text size="lg" fw={600} c="primary">
        Offering {offeringId}
      </Text>
      
      {offeringForecasts.length === 0 ? (
        <div className="text-center py-8">
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
        />
      )}
    </Stack>
  </Card>
); 