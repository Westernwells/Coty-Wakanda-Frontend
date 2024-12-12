import { createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { LayoutComponent } from "./_layout";

interface MyRouterContext {
  auth: boolean;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <LayoutComponent />
      <TanStackRouterDevtools />
    </>
  ),
});
