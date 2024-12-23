import ChevronDownIcon from "@/components/Icons/ChevronDownIcon";
import DateIcon from "@/components/Icons/DateIcon";
import { FormSection } from "@/components/Shared/Form/Section";
import Headline from "@/components/Shared/Headline";
import InfoCard from "@/components/Shared/InfoCard";
import { useUserStore } from "@/stores/userStore";
import {
  Button,
  Divider,
  Grid,
  Group,
  Select,
  Table,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/forecast-details/$forecastId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { forecastId } = Route.useParams();
  const role = useUserStore((state) => state.user?.role);
  const foreCastData = {
    id: forecastId,
    name: "B6 EXT3   P PRFM 30ml IV",
    brand: "Burberry",
    offeringNumber: "160439474",
  };

  const salesData = [
    { date: "Mar 25", value: "00" },
    { date: "Apr 25", value: "00" },
    { date: "May 25", value: "00" },
    { date: "Jun 25", value: "00" },
    { date: "Jul 25", value: "00" },
    { date: "Aug 25", value: "00" },
    { date: "Sep 25", value: "00" },
    { date: "Oct 25", value: "00" },
    { date: "Nov 25", value: "00" },
    { date: "Dec 25", value: "00" },
    { date: "Jan 25", value: "00" },
    { date: "Feb 25", value: "00" },
    { date: "Mar 26", value: "00" },
    { date: "Apr 26", value: "00" },
    { date: "May 26", value: "00" },
    { date: "Jun 26", value: "00" },
  ];
  return (
    <div className="w-full">
      <Headline title={foreCastData.name} />
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
          <p className="text-sm">{foreCastData.brand}</p>
        </div>
        <Divider orientation="vertical" size="md" color="#002554" />
        <div>
          <p className="sm:text-lg text-base">Offering number</p>
          <p className="text-sm">{foreCastData.offeringNumber}</p>
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
                    {salesData.map((item, index) => (
                      <Table.Th key={index}>{item.date}</Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody className="bg-[#f2f4f6]">
                  {salesData.map((element, index) => (
                    <Table.Td key={index}>{element.value}</Table.Td>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </div>
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
                    {salesData.map((item, index) => (
                      <Table.Th key={index}>{item.date}</Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody className="bg-[#f2f4f6]">
                  {salesData.map((element, index) => (
                    <Table.Td key={index}>{element.value}</Table.Td>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </div>
          {role === "admin" && (
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
                      {salesData.map((item, index) => (
                        <Table.Th key={index}>{item.date}</Table.Th>
                      ))}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody className="bg-[#f2f4f6]">
                    {salesData.map((element, index) => (
                      <Table.Td key={index}>{element.value}</Table.Td>
                    ))}
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
