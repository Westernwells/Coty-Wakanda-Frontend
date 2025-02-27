import { useUserStore } from "@/stores/userStore";
import Navbar from "../components/Layout/Navbar";
import { createFileRoute } from "@tanstack/react-router";
import { LoadingOverlay } from "@mantine/core";
import { useEffect } from "react";
import { useUser } from "@/api/user/get-user";
import Cookies from "js-cookie";

export const Route = createFileRoute("/_layout")({
    component: LayoutComponent,
});

export function LayoutComponent() {
  const auth = useUserStore((state) => state.isSignedIn);
  const login = useUserStore((state) => state.signIn);
  const userQuery = useUser();
  useEffect(() => {
    if(userQuery.data?.data){
      login(userQuery.data.data.data, Cookies.get("token") ?? "")
    }
  }, [login, auth, userQuery]);
    return (
        <div className="flex">
            <Navbar />
            <LoadingOverlay visible={userQuery.isLoading} zIndex={1000} overlayProps={{ backgroundOpacity: 1 }} />
        </div>
    );
}
