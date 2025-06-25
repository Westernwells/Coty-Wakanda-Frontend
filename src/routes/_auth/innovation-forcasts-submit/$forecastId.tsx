import FileDownloadIcon from '@/components/Icons/FileDownloadIcon';
import PlusIcon from '@/components/Icons/PlusIcon';
import SubmitModal from '@/components/Distributor-forcasts/SubmitModal';
import { OfferingTable } from '@/components/Distributor-forcasts/components/OfferingTable';
import { FormSection } from '@/components/Shared/Form/Section';
import Headline from '@/components/Shared/Headline';
import InfoCard from '@/components/Shared/InfoCard';
import { Button, Grid, Group, Radio } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useForecastTransform } from '@/components/Distributor-forcasts/hooks/use-forecast-transform';
import { formatDate } from '@/utils/date';
import { useForecastData } from '@/components/Distributor-forcasts/hooks/use-forecast-data';
import { useForm } from '@mantine/form';
import { ForecastDetailsData, ForecastSubmitInput } from '@/types';
import axios from 'axios';
import SaveFooter from '@/components/DistributorPages/Shared/SaveFooterBaseForecast';

export const Route = createFileRoute(
  '/_auth/innovation-forcasts-submit/$forecastId'
)({
  component: RouteComponent,
});

function RouteComponent() {
  const [opened, { open, close }] = useDisclosure(false);
  const params = useParams({
    from: '/_auth/innovation-forcasts-submit/$forecastId',
  });
  const [selectedType, setSelectedType] = useState<string>('all');
  const {
    forecastResponse,
    offerings,
    offeringProducts,
    listResp,
    isLoading,
    error,
  } = useForecastData(params.forecastId);
  const savedForecasts = listResp?.data?.forecast || [];
  const { months, transformedForecasts } = useForecastTransform(
    offerings,
    offeringProducts,
    savedForecasts,
    forecastResponse?.data,
    selectedType
  );

  // Convert transformed forecasts to the format expected by OfferingTable
  const forecastsByOffering = useMemo(() => {
    return transformedForecasts.reduce(
      (acc: Record<string, any[]>, forecast) => {
        acc[forecast.offeringNumber] = forecast.data.map(
          (item: any, index: number) => ({
            product: {
              //id: index,
              id: item.id,
              brand: { name: item.brand },
              sku: item.sku,
              material_description: item.launchId,
              offering_number: parseInt(item.launchId) || 0,
              brand_pillar: {
                id: item.brand_pillar.id,
                name: item.brand_pillar.name,
              },
            },
            cost: parseFloat(item.cost) || 0,
            monthly_total: 0,
            sub_total: 0,
            // items: months.reduce(
            //   (
            //     monthAcc: Record<
            //       string,
            //       { value: string | number; is_closed: boolean }
            //     >,
            //     month: string,
            //     monthIndex: number
            //   ) => {
            //     monthAcc[month] = {
            //       value: parseFloat(item[month] as string) || 0,
            //       is_closed: false,
            //     };
            //     return monthAcc;
            //   },
            //   {} as Record<
            //     string,
            //     { value: string | number; is_closed: boolean }
            //   >
            // ),
            items: item.items,
          })
        );
        return acc;
      },
      {} as Record<string, any[]>
    );
  }, [transformedForecasts, months]);

  // Initialize form with forecast data
  const initialForecastValues = useMemo(() => {
    return Object.values(forecastsByOffering)
      .flat()
      .map((forecast: any, index: number) => ({
        product_id: forecast.product.id,
        items: Object.keys(forecast.items).map(
          (month: string, monthIndex: number) => ({
            month,
            value: forecast.items[month].value,
          })
        ),
      }));
  }, [forecastsByOffering]);

  const form = useForm<{ forecast: ForecastSubmitInput[] }>({
    initialValues: {
      forecast: initialForecastValues,
    },
  });
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && initialForecastValues.length > 0) {
      form.setValues({ forecast: initialForecastValues });
      initialized.current = true;
    }
  }, [initialForecastValues, form]);
  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Error loading forecast details</div>;

  return (
    <div className="w-full">
      <Headline
        title={
          forecastResponse?.data?.product?.offering_number?.toString() ||
          'Forecast Details'
        }
      />
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
                    label: 'text-primary text-sm pl-[5px] sm:pl-2',
                  }}
                />
                <Radio
                  value="saleable"
                  label="Saleable"
                  classNames={{
                    label: 'text-primary text-sm pl-[5px] sm:pl-2',
                  }}
                />
                <Radio
                  value="non-saleable"
                  label="Non-saleable"
                  classNames={{
                    label: 'text-primary text-sm pl-[5px] sm:pl-2',
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
              data={
                forecastResponse?.data?.forecast_deadline
                  ? formatDate(forecastResponse.data.forecast_deadline)
                  : 'N/A'
              }
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      {transformedForecasts.map((forecast, index) => {
        return (
          <OfferingTable
            key={index}
            offeringId={forecast.offeringNumber}
            offeringForecasts={
              forecastsByOffering[forecast.offeringNumber] || []
            }
            data={forecastResponse?.data as ForecastDetailsData}
            form={form}
            offerings={offerings}
            status={true}
            forecastsByOffering={forecastsByOffering}
          />
        );
      })}

      {/* <Group justify="flex-end" mt="xl" gap={10}>
        <Button
          variant="outline"
          className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
          leftSection={<FileDownloadIcon />}
          onClick={handleSave} // task save button
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
      </Group> */}

      <SaveFooter
        forecastId={params.forecastId}
        title="Submit Forecast"
        form={form}
      />

      <SubmitModal opened={opened} close={close} />
    </div>
  );
}
