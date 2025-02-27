import { createRootRouteWithContext } from "@tanstack/react-router";
import { LayoutComponent } from "./_layout";
import { ToastContainer } from "react-toastify";

interface MyRouterContext {
  auth: boolean;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <LayoutComponent />
      <ToastContainer autoClose={3000} />
    </>
  ),
});
