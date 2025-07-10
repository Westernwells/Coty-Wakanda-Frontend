import AdminSettings from "@/components/SettingsPage/AdminSettings";
import DistributorSettings from "@/components/SettingsPage/DistributorSettings";
import Headline from "@/components/Shared/Headline";
import { useUserStore } from "@/stores/userStore";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Tabs, Group } from "@mantine/core";
import CoreCategorySettings from "@/components/ApplicationSettings/CoreCategorySettings";
import MarketSettings from "@/components/ApplicationSettings/MarketSettings";
import SegmentSettings from "@/components/ApplicationSettings/SegmentSettings";
import SubCategorySettings from "@/components/ApplicationSettings/SubCategorySettings";
import PricingListSettings from "@/components/ApplicationSettings/PricingListSettings";
import BillingListSettings from "@/components/ApplicationSettings/BillingListSettings";
import { z } from "zod";
import { useState } from "react";
import LinesSettings from "@/components/ApplicationSettings/LinesSettings";

// Define search params schema
export const settingsSearchSchema = z.object({
  tab: z.string().optional().default("system"),
});

export const Route = createFileRoute("/_auth/settings/")({
  validateSearch: settingsSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const user = useUserStore((state) => state.user);
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [activeSegmentTab, setActiveSegmentTab] = useState<string>("markets");

  const handleTabChange = (value: string | null) => {
    navigate({
      search: (prev) => ({ ...prev, tab: value || "system" }),
      replace: true,
    });
  };

  const handleSegmentTabChange = (value: string | null) => {
    if (value) {
      setActiveSegmentTab(value);
    }
  };

  return (
    <div className="w-full">
      <Headline title="Settings" />
      <section className="mt-3 sm:mt-8">
        {user?.role === "admin" ? (
          <Tabs
            color="#002554"
            className="text-primary"
            value={search.tab}
            onChange={handleTabChange}
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
                value={activeSegmentTab}
                onChange={handleSegmentTabChange}
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
                    <Tabs.Tab
                      value="lines"
                      className="text-base font-medium text-start"
                    >
                      Lines
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
                <Tabs.Panel value="lines">
                  <LinesSettings />
                </Tabs.Panel>
              </Tabs>
            </Tabs.Panel>

            <Tabs.Panel value="pricing">
              <div className="mt-4">
                <PricingListSettings />
              </div>
            </Tabs.Panel>

            <Tabs.Panel value="billing">
              <div className="mt-4">
                <BillingListSettings />
              </div>
            </Tabs.Panel>
          </Tabs>
        ) : (
          <DistributorSettings />
        )}
      </section>
    </div>
  );
}
