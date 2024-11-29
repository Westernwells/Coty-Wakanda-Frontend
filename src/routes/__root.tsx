import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { LayoutComponent } from "./_layout";

export const Route = createRootRoute({
    component: () => (
        <>
            <LayoutComponent />
            <TanStackRouterDevtools />
        </>
    ),
});
