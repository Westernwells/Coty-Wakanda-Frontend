import "./index.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import { MantineProvider } from "@mantine/core";
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { routeTree } from "./routeTree.gen";
import { useUserStore } from "./stores/userStore";

const router = createRouter({ routeTree, context: { auth: false } });
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function InnerApp() {
  const auth = useUserStore((state) => state.isSignedIn);
  return <RouterProvider router={router} context={{ auth }} />;
}
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
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
                    minHeight: 40,
                    borderRadius: 5,
                    borderColor: "transparent",
                  },
                },
              },
              PasswordInput: {
                styles: {
                  input: {
                    backgroundColor: "#F2F4F6",
                    minHeight: 40,
                    borderRadius: 5,
                    borderColor: "transparent",
                  },
                },
              },
              FileInput: {
                styles: {
                  input: {
                    backgroundColor: "#F2F4F6",
                    minHeight: 40,
                    borderRadius: 5,
                    borderColor: "transparent",
                  },
                },
              },
              Select: {
                styles: {
                  input: {
                    backgroundColor: "#F2F4F6",
                    minHeight: 40,
                    borderRadius: 5,
                    borderColor: "transparent",
                  },
                },
              },
              MultiSelect: {
                styles: {
                  input: {
                    backgroundColor: "#F2F4F6",
                    borderRadius: 5,
                    minHeight: 40,
                    borderColor: "transparent",
                  },
                },
              },
              DateInput: {
                styles: {
                  input: {
                    backgroundColor: "#F2F4F6",
                    minHeight: 40,
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
          <InnerApp />
        </MantineProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}
