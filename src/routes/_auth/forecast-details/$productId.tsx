import { getForecastDetails } from "@/api/forecasts/get-forecast-details";
import ChevronDownIcon from "@/components/Icons/ChevronDownIcon";
import DateIcon from "@/components/Icons/DateIcon";
import ErrorCard from "@/components/Shared/ErrorCard";
import { FormSection } from "@/components/Shared/Form/Section";
import Headline from "@/components/Shared/Headline";
import InfoCard from "@/components/Shared/InfoCard";
import { useUserStore } from "@/stores/userStore";
import {
  Button,
  Divider,
  Grid,
  Group,
  Loader,
  Select,
  Table,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/forecast-details/$productId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { productId } = Route.useParams();
  const role = useUserStore((state) => state.user?.role);
  const { data, isError, isLoading } = useQuery({
    queryKey: ["forecast", productId],
    queryFn: () => getForecastDetails(productId),
  });
  const foreCastData = data?.data;

  if (isError) {
    return <ErrorCard />;
  }
  if (isLoading || !foreCastData) {
    return (
      <div className="w-full h-full pt-[20%] text-center">
        <Loader />
      </div>
    );
  }
  return (
    <div className="w-full">
      <Headline title={foreCastData?.product.offering_number} />
      <Button
        leftSection={
          <div className="rotate-90">
            <ChevronDownIcon />
          </div>
        }
        variant="default"
        className="border-none bg-transparent   text-primary text-sm font-medium  p-0 before:content-none"
        component={Link}
        to="/forecasting"
      >
        Back to Forecasting
      </Button>
      <Group className="text-primary font-medium mt-6">
        <div>
          <p className="sm:text-lg text-base">Brand</p>
          <p className="text-sm">{foreCastData?.product.brand.name}</p>
        </div>
        <Divider orientation="vertical" size="md" color="#3A3A3AFF" />
        <div>
          <p className="sm:text-lg text-base">Offering number</p>
          <p className="text-sm">{foreCastData?.product.offering_number}</p>
        </div>
      </Group>
      <section className="mt-3">
        <FormSection title="Forecasting Details" className="mt-2 sm:mt-5">
          <Select
            data={[
              { value: "usd", label: "USD" },
              { value: "eur", label: "EUR" },
            ]}
            placeholder="Currency"
            className="md:max-w-[33%] max-w-full"
          />
          <Grid>
            <Grid.Col
              span={{
                sm: 4,
                base: 12,
              }}
            >
              <InfoCard title="start date" data="00 Mar 2024"></InfoCard>
            </Grid.Col>
            <Grid.Col
              span={{
                sm: 4,
                base: 12,
              }}
            >
              <InfoCard title="end date" data="00 Mar 2024"></InfoCard>
            </Grid.Col>
            <Grid.Col
              span={{
                sm: 4,
                base: 12,
              }}
            >
              <InfoCard
                title="Units forecast (Financial Year 2025)"
                data="xx"
              ></InfoCard>
            </Grid.Col>
          </Grid>
        </FormSection>
      </section>
      <section className="mt-3">
        <FormSection title="Sales Information" className="mt-2 sm:mt-5">
          <Group className="md:max-w-[30%] max-w-full">
            <DateInput
              aria-label="Start Date"
              placeholder="Start Date"
              clearable
              variant="filled"
              className="grow"
              rightSection={<DateIcon />}
            />
            <DateInput
              aria-label="End Date"
              placeholder="End Date"
              clearable
              variant="filled"
              className="grow"
              rightSection={<DateIcon />}
            />
          </Group>
          <div>
            <Title
              order={3}
              className="text-primary font-semibold sm:text-lg text-base"
            >
              Unit forecast
            </Title>
            <Table.ScrollContainer minWidth={768}>
              <Table
                verticalSpacing="sm"
                borderColor="transparent"
                striped="even"
                stripedColor="#F2F4F6"
              >
                <Table.Thead>
                  <Table.Tr className="bg-primary text-white">
                    {Object.keys(foreCastData.unit_forecast).map(
                      (item, index) => (
                        <Table.Th key={index}>{item}</Table.Th>
                      )
                    )}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody className="bg-[#f2f4f6]">
                  {Object.keys(foreCastData?.unit_forecast).map(
                    (item, index) => (
                      <Table.Td key={index}>
                        {foreCastData.unit_forecast[item].value}
                      </Table.Td>
                    )
                  )}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </div>
          {Object.keys(foreCastData?.gross_sales).length !== 0 && (
            <div>
              <Title
                order={3}
                className="text-primary font-semibold sm:text-lg text-base"
              >
                Gross sales
              </Title>
              <Table.ScrollContainer minWidth={768}>
                <Table
                  verticalSpacing="sm"
                  borderColor="transparent"
                  striped="even"
                  stripedColor="#F2F4F6"
                >
                  <Table.Thead>
                    <Table.Tr className="bg-primary text-white">
                      {Object.keys(foreCastData?.gross_sales).map(
                        (item, index) => (
                          <Table.Th key={index}>{item}</Table.Th>
                        )
                      )}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody className="bg-[#f2f4f6]">
                    {Object.keys(foreCastData?.gross_sales).map(
                      (item, index) => (
                        <Table.Td key={index}>
                          {foreCastData.gross_sales[item].value ?? 0}
                        </Table.Td>
                      )
                    )}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </div>
          )}
          {role === "admin" &&
            Object.keys(foreCastData?.monthly_average).length !== 0 && (
              <div>
                <Title
                  order={3}
                  className="text-primary font-semibold sm:text-lg text-base"
                >
                  Monthly average
                </Title>
                <Table.ScrollContainer minWidth={768}>
                  <Table
                    verticalSpacing="sm"
                    borderColor="transparent"
                    striped="even"
                    stripedColor="#F2F4F6"
                  >
                    <Table.Thead>
                      <Table.Tr className="bg-primary text-white">
                        {Object.keys(foreCastData?.monthly_average).map(
                          (item, index) => (
                            <Table.Th key={index}>{item}</Table.Th>
                          )
                        )}
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody className="bg-[#f2f4f6]">
                      {Object.keys(foreCastData?.monthly_average).map(
                        (item, index) => (
                          <Table.Td key={index}>
                            {foreCastData.monthly_average[item].value ?? 0}
                          </Table.Td>
                        )
                      )}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </div>
            )}
        </FormSection>
      </section>
    </div>
  );
}
