import Navbar from "../components/Layout/Navbar";
import { createFileRoute } from "@tanstack/react-router";

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
