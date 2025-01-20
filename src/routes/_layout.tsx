import { useUserStore } from "@/stores/userStore";
import Navbar from "../components/Layout/Navbar";
import { createFileRoute } from "@tanstack/react-router";
import { LoadingOverlay } from "@mantine/core";
import { useEffect } from "react";
import { getUser } from "@/api/get-user";
import Cookies from "js-cookie";

export const Route = createFileRoute("/_layout")({
    component: LayoutComponent,
});

export function LayoutComponent() {
  const auth = useUserStore((state) => state.isSignedIn);
  const login = useUserStore((state) => state.signIn);
  const setLoading = useUserStore((state) => state.setLoading);
  const isLoading = useUserStore(state => state.loading)
  useEffect(() => {
    const getUserData = async () => {
      setLoading(true);
      await getUser().then(data => {
        login(data.data, Cookies.get("token") ?? "");
      }).catch(() => {
        Cookies.remove('token')
      }).finally(() => {
        setLoading(false)
      });
    };
    if (!auth && Cookies.get('token')) {
      getUserData();
    }
  }, [login, auth, setLoading]);
    return (
        <div className="flex">
            <Navbar />
            <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ backgroundOpacity: 1 }} />
        </div>
    );
}
