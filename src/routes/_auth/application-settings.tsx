import CoreCategorySettings from "@/components/ApplicationSettings/CoreCategorySettings";
import MarketSettings from "@/components/ApplicationSettings/MarketSettings";
import SegmentSettings from "@/components/ApplicationSettings/SegmentSettings";
import SubCategorySettings from "@/components/ApplicationSettings/SubCategorySettings";
import Headline from "@/components/Shared/Headline";
import { Button, Group, Tabs } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PackageOpen, ReceiptText } from "lucide-react";

export const Route = createFileRoute("/_auth/application-settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full">
      <Headline title="Settings" />
      <Group className="mt-5">
        <Button
          rightSection={<PackageOpen className="size-5" />}
          variant="default"
          className="border-none bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
          component={Link}
          to="/product-list"
        >
          Product List
        </Button>
        <Button
          rightSection={<ReceiptText className="size-5" />}
          variant="default"
          className="border-none bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
          component={Link}
          to="/billing-list"
        >
          Billing List
        </Button>
      </Group>
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
