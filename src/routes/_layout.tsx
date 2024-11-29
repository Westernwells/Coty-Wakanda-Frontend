import { createFileRoute, Outlet } from "@tanstack/react-router";
import Navbar from "../components/Layout/Navbar";

export const Route = createFileRoute("/_layout")({
    component: LayoutComponent,
});

export function LayoutComponent() {
    return (
        <div className="flex ">
            <Navbar />
        </div>
    );
}
