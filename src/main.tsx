import { StrictMode } from "react";
import "./index.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

import { MantineProvider } from "@mantine/core";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import ReactDOM from "react-dom/client";
const router = createRouter({ routeTree });
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <StrictMode>
            <MantineProvider
                theme={{
                    fontFamily: "Poppins",
                    breakpoints: {
                        md: "768px",
                    },
                    components: {
                        TextInput: {
                            styles: {
                                input: {
                                    backgroundColor: "#F2F4F6",
                                    height: 40,
                                    borderRadius: 5,
                                    borderColor: "transparent",
                                },
                            },
                        },
                        FileInput: {
                            styles: {
                                input: {
                                    backgroundColor: "#F2F4F6",
                                    height: 40,
                                    borderRadius: 5,
                                    borderColor: "transparent",
                                },
                            },
                        },
                        Select: {
                            styles: {
                                input: {
                                    backgroundColor: "#F2F4F6",
                                    height: 40,
                                    borderRadius: 5,
                                    borderColor: "transparent",
                                },
                            },
                        },
                        DateInput: {
                            styles: {
                                input: {
                                    backgroundColor: "#F2F4F6",
                                    height: 40,
                                    borderRadius: 5,
                                },
                            },
                        },
                        Table: {
                            styles: {
                                table: {
                                    borderCollapse: "collapse",
                                },
                                th: {
                                    fontSize: "12px",
                                    height: "47px",
                                    paddingInline: "12px",
                                },
                                td: {
                                    paddingBlock: "11.25px",
                                    paddingInline: "12px",
                                    fontSize: "12px",
                                    color: "#002554",
                                },
                            },
                        },
                        Chip: {
                            styles: {
                                iconWrapper: {
                                    display: "none",
                                },
                            },
                        },
                    },
                }}
            >
                <RouterProvider router={router} />
            </MantineProvider>
        </StrictMode>
    );
}
