import { FormSection } from "../../Shared/Form/Section";
import { Grid, Group, Radio } from "@mantine/core";
import InfoCard from "../../Shared/InfoCard";

const DeadlineHeader = ({ title }: { title: string }) => {
  return (
    <FormSection title={title} className="mt-2 sm:mt-5">
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
  );
};

export default DeadlineHeader;
