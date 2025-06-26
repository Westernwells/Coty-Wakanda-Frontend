import { Button, Group } from "@mantine/core";
import { Link, createFileRoute } from "@tanstack/react-router";

import Headline from "@/components/Shared/Headline";
import PlusIcon from "@/components/Icons/PlusIcon";
import InnovationForecastsTable from "@/components/Innovations/InnovationForecastsTable";

export const Route = createFileRoute("/_auth/innovations")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full">
      <Headline title="Innovations" />
      <section className="mt-3 sm:mt-8">
        <Group>
          <Button
            rightSection={<PlusIcon />}
            variant="default"
            className="border-none bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
            component={Link}
            to="/add-innovation"
          >
            Add new innovation
          </Button>
        </Group>
        <InnovationForecastsTable />
      </section>
    </div>
  );
}
