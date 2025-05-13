import AdminSettings from "@/components/SettingsPage/AdminSettings";
import DistributorSettings from "@/components/SettingsPage/DistributorSettings";
import Headline from "@/components/Shared/Headline";
import { useUserStore } from "@/stores/userStore";
import { createFileRoute } from "@tanstack/react-router";
import { Tabs, Group } from "@mantine/core";
import { useState, useEffect } from "react";
import CoreCategorySettings from "@/components/ApplicationSettings/CoreCategorySettings";
import MarketSettings from "@/components/ApplicationSettings/MarketSettings";
import SegmentSettings from "@/components/ApplicationSettings/SegmentSettings";
import SubCategorySettings from "@/components/ApplicationSettings/SubCategorySettings";
import PricingListSettings from "@/components/ApplicationSettings/PricingListSettings";
import { z } from "zod";

// Define search params schema
const settingsSearchSchema = z.object({
  tab: z.string().optional(),
});

export const Route = createFileRoute("/_auth/settings/")({
  validateSearch: settingsSearchSchema, // Validate search params
  component: RouteComponent,
});

function RouteComponent() {
  const user = useUserStore((state) => state.user);
  const search = Route.useSearch();

  const [activeTab, setActiveTab] = useState<string | null>(
    search.tab || "system"
  );
  const [activeSegmentTab, setActiveSegmentTab] = useState<string | null>(
    "markets"
  );

  // Effect to update tab if search param changes after initial load (optional, but good practice)
  useEffect(() => {
    if (search.tab && search.tab !== activeTab) {
      setActiveTab(search.tab);
    }
  }, [search.tab, activeTab]);

  return (
    <div className="w-full">
      <Headline title="Settings" />
      <section className="mt-3 sm:mt-8">
        {user?.role === "admin" ? (
          <Tabs
            color="#002554"
            className="text-primary"
            defaultValue="system"
            value={activeTab}
            onChange={setActiveTab}
          >
            <Tabs.List className="before:border-0 mb-6">
              <Tabs.Tab
                value="system"
                className="text-base font-medium text-start"
              >
                System settings
              </Tabs.Tab>
              <Tabs.Tab
                value="segments"
                className="text-base font-medium text-start"
              >
                Market segments and categories
              </Tabs.Tab>
              <Tabs.Tab
                value="pricing"
                className="text-base font-medium text-start"
              >
                Pricing list
              </Tabs.Tab>
              <Tabs.Tab
                value="billing"
                className="text-base font-medium text-start"
              >
                Billing list
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="system">
              <AdminSettings />
            </Tabs.Panel>

            <Tabs.Panel value="segments">
              <h2 className="text-xl font-semibold py-5">
                Market segments and categories
              </h2>
              <Tabs
                color="#002554"
                className="text-primary hidden sm:block"
                defaultValue="markets"
                value={activeSegmentTab}
                onChange={setActiveSegmentTab}
              >
                <Group className="bg-white shadow-md rounded-t-lg p-6">
                  <Tabs.List className="before:border-0">
                    <Tabs.Tab
                      value="markets"
                      className="text-base font-medium text-start"
                    >
                      Markets
                    </Tabs.Tab>
                    <Tabs.Tab
                      value="segments"
                      className="text-base font-medium text-start"
                    >
                      Segments
                    </Tabs.Tab>
                    <Tabs.Tab
                      value="core-categories"
                      className="text-base font-medium text-start"
                    >
                      Core Categories
                    </Tabs.Tab>
                    <Tabs.Tab
                      value="sub-categories"
                      className="text-base font-medium text-start"
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
            </Tabs.Panel>

            <Tabs.Panel value="pricing">
              <div className="mt-4">
                <PricingListSettings />
              </div>
            </Tabs.Panel>

            <Tabs.Panel value="billing">
              <div className="mt-4">{/* Billing content will go here */}</div>
            </Tabs.Panel>
          </Tabs>
        ) : (
          <DistributorSettings />
        )}
      </section>
    </div>
  );
}
