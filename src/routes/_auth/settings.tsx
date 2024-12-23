import AdminSettings from "@/components/SettingsPage/AdminSettings";
import DistributorSettings from "@/components/SettingsPage/DistributorSettings";
import Headline from "@/components/Shared/Headline";
import { useUserStore } from "@/stores/userStore";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const user = useUserStore((state) => state.user);
  return (
    <div className="w-full">
      <Headline title="Settings" />
      <section className="mt-3 sm:mt-8">
        {user?.role === "admin" ? <AdminSettings /> : <DistributorSettings />}
      </section>
    </div>
  );
}
