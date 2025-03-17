import CoreCategorySettings from "@/components/ApplicationSettings/CoreCategorySettings";
import MarketSettings from "@/components/ApplicationSettings/MarketSettings";
import SegmentSettings from "@/components/ApplicationSettings/SegmentSettings";
import SubCategorySettings from "@/components/ApplicationSettings/SubCategorySettings";
import Headline from "@/components/Shared/Headline";
import { Group, Tabs } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/application-settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full">
      <Headline title="Innovations" />
      <section className="mt-3 sm:mt-8">
        <Tabs
          color="#002554"
          className="text-primary hidden sm:block"
          defaultValue="markets"
        >
          <Group className="bg-white shadow-md rounded-t-lg p-6 mt-5">
            <Tabs.List className="before:border-0">
              <Tabs.Tab value="markets" className="grow text-base font-medium">
                Markets
              </Tabs.Tab>
              <Tabs.Tab value="segments" className="grow text-base font-medium">
                Segments
              </Tabs.Tab>
              <Tabs.Tab
                value="core-categories"
                className="grow text-base font-medium"
              >
                Core Categories
              </Tabs.Tab>
              <Tabs.Tab
                value="sub-categories"
                className="grow text-base font-medium"
              >
                Sub Categories
              </Tabs.Tab>
            </Tabs.List>
          </Group>

          <Tabs.Panel value="markets">
            <MarketSettings />
          </Tabs.Panel>
          <Tabs.Panel value="segments">
            <SegmentSettings />
          </Tabs.Panel>
          <Tabs.Panel value="core-categories">
            <CoreCategorySettings />
          </Tabs.Panel>
          <Tabs.Panel value="sub-categories">
            <SubCategorySettings />
          </Tabs.Panel>
        </Tabs>
      </section>
    </div>
  );
}
