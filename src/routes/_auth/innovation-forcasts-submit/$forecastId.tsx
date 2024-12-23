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

export const Route = createFileRoute(
  "/_auth/innovation-forcasts-submit/$forecastId"
)({
  component: RouteComponent,
});

const forecast = [
  {
    brand: "Chloe",
    pillar: "Distributor example",
    sku: "SKU Example",
    launchId: "Brand-SubBrand-Year-Format-LaunchName",
    cost: "dist1, dist2, dist3",
    date1: "00",
    date2: "00",
    date3: "00",
    date4: "00",
    date5: "00",
    date6: "00",
  },
  ...Array(8).fill({
    brand: "Chloe",
    pillar: "Distributor example",
    sku: "SKU Example",
    launchId: "Brand-SubBrand-Year-Format-LaunchName",
    cost: "dist1, dist2, dist3",
    date1: "00",
    date2: "00",
    date3: "00",
    date4: "00",
    date5: "00",
    date6: "00",
  }),
];

function RouteComponent() {
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <div className="w-full">
      <Headline title={forecast[0].launchId} />
      <FormSection title="Forecast Details" className="mt-2 sm:mt-5">
        <Grid>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <Radio.Group name="type">
              <Group
                gap={24}
                w="100%"
                className="mt-[10px] flex-col sm:flex-row  items-start "
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
            <InfoCard title="Forecast deadline" data="00 Mar 2024"></InfoCard>
          </Grid.Col>
        </Grid>
      </FormSection>
      <SubmitTable forecast={forecast} />
      <Group justify="flex-end" mt="xl" gap={10}>
        <Button
          variant="outline"
          className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
          leftSection={<FileDownloadIcon />}
          onClick={() => {}}
        >
          Save
        </Button>
        <Button
          leftSection={<PlusIcon />}
          type="submit"
          variant="outline"
          className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
          onClick={() => open()}
        >
          Submit
        </Button>
        <SubmitModal opened={opened} close={close} />
      </Group>
    </div>
  );
}
