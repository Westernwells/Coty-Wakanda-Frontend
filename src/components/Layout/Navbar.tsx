import {
  AppShell,
  Burger,
  CloseButton,
  Group,
  Stack,
  UnstyledButton,
} from "@mantine/core";
import {
  Link,
  Outlet,
  useMatchRoute,
  useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";

import Logo from "@/assets/logo.svg";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/userStore";
import { useDisclosure } from "@mantine/hooks";
import AvatarIcon from "../Icons/AvatarIcon";
import BellIcon from "../Icons/BellIcon";
import BoxIcon from "../Icons/BoxIcon";
import ChartAreaIcon from "../Icons/ChartAreaIcon";
import DashboardIcon from "../Icons/DashboardIcon";
import FileDocumentIcon from "../Icons/FileDocumentIcon";
import GroupIcon from "../Icons/GroupIcon";
import LightBulbIcon from "../Icons/LightBulbIcon";
import PlusIcon from "../Icons/PlusIcon";
import SettingsIcon from "../Icons/SettingsIcon";
import ShoppingCart from "../Icons/ShoppingCartIcon";
import CollapseIcon from "../Icons/CollapseIcon";

const Navbar = () => {
  const matchRoute = useMatchRoute();
  const isSignedIn = useUserStore((state) => state.isSignedIn);
  const role = useUserStore((state) => state.user?.role);
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();

  const [isDesktopNavbarCollapsed, setIsDesktopNavbarCollapsed] =
    useState(false);
  const DESKTOP_NAVBAR_EXPANDED_WIDTH = 256;
  const DESKTOP_NAVBAR_COLLAPSED_WIDTH = 80;

  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const links =
    role === "admin"
      ? [
          { link: "/", label: "Dashboard", icon: DashboardIcon },
          { link: "/forecasting", label: "Forecasting", icon: ChartAreaIcon },
          { link: "/innovations", label: "Innovations", icon: LightBulbIcon },
          { link: "/distributors", label: "Distributors", icon: GroupIcon },
          { link: "/products", label: "Products", icon: ShoppingCart },

          { link: "/orders", label: "Orders", icon: BoxIcon },
          // { link: "/reporting", label: "Reporting", icon: FileDocumentIcon },
        ]
      : [
          { link: "/", label: "Dashboard", icon: DashboardIcon },
          {
            link: "/innovation-list",
            label: "Innovation forecasts",
            icon: LightBulbIcon,
          },
          {
            link: "/base-forecasts",
            label: "Base forecasts",
            icon: LightBulbIcon,
          },
          { link: "/products", label: "Products", icon: ShoppingCart },
          { link: "/orders", label: "Orders", icon: BoxIcon },
          { link: "/stock-on-hand", label: "Stock On Hand", icon: BoxIcon },
          { link: "/sales", label: "Sales", icon: BoxIcon },
        ];

  return (
    <AppShell
      navbar={{
        width: isDesktopNavbarCollapsed
          ? DESKTOP_NAVBAR_COLLAPSED_WIDTH
          : DESKTOP_NAVBAR_EXPANDED_WIDTH,
        breakpoint: "md",
        collapsed: { mobile: !opened },
      }}
    >
      <AppShell.Header className=" bg-primary px-4 py-4 md:hidden">
        <Group align="center">
          <Burger
            color="#FFF"
            opened={opened}
            onClick={toggle}
            hiddenFrom="md"
            size="sm"
          />
          <img src={Logo} alt="Logo" width={80} />
        </Group>
      </AppShell.Header>
      {isSignedIn && (
        <AppShell.Navbar
          className={cn(
            "bg-primary border-0 md:flex flex-col h-screen transition-all duration-300 ease-in-out",
            isDesktopNavbarCollapsed
              ? "px-2 py-3  lg:px-3"
              : "px-4 py-3  lg:px-6"
          )}
        >
          <CloseButton
            className="absolute text-white right-4 top-4 md:hidden"
            size="lg"
            bg="transparent"
            onClick={toggle}
          />
          <div
            className={cn(
              "pb-6",
              isDesktopNavbarCollapsed
                ? "flex flex-col items-center"
                : "flex flex-col items-stretch"
            )}
          >
            <UnstyledButton
              onClick={() =>
                setIsDesktopNavbarCollapsed(!isDesktopNavbarCollapsed)
              }
              className={cn(
                "hidden md:block text-white hover:bg-white hover:bg-opacity-10 rounded p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white mb-2",
                isDesktopNavbarCollapsed ? "self-end" : "self-end"
              )}
              aria-label={
                isDesktopNavbarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
            >
              <CollapseIcon
                stroke="white"
                className={cn(
                  "h-6 w-6 transition-transform duration-300 ease-in-out",
                  isDesktopNavbarCollapsed && "transform rotate-180 "
                )}
              />
            </UnstyledButton>

            {!isDesktopNavbarCollapsed && (
              <Link
                to="/"
                aria-label="Go to homepage"
                className="self-center pt-4"
              >
                <img src={Logo} alt="Logo" />
              </Link>
            )}
            {isDesktopNavbarCollapsed && (
              <Link
                to="/"
                aria-label="Go to homepage"
                className="flex justify-center w-full pt-2"
              >
                <img src={Logo} alt="Logo" className="w-12 h-auto" />
              </Link>
            )}
          </div>

          <Group
            className={cn(
              "bg-white rounded-xl py-3 bg-opacity-10 flex items-center gap-x-3 flex-nowrap mb-6",
              isDesktopNavbarCollapsed
                ? "flex-col px-2 gap-y-3"
                : "justify-center px-5"
            )}
          >
            <UnstyledButton
              onClick={() => navigate({ to: "/profile" })}
              title="Profile"
              className={cn(
                isDesktopNavbarCollapsed &&
                  "focus:outline-none focus-visible:outline-none"
              )}
            >
              <AvatarIcon
                hasOutline={
                  !isDesktopNavbarCollapsed &&
                  !matchRoute({ to: "/profile", fuzzy: true })
                }
                isActive={!!matchRoute({ to: "/profile", fuzzy: true })}
              />
            </UnstyledButton>
            <UnstyledButton
              onClick={() => navigate({ to: "/settings" })}
              title="Settings"
              className={cn(
                isDesktopNavbarCollapsed &&
                  "focus:outline-none focus-visible:outline-none"
              )}
            >
              <SettingsIcon
                hasOutline={
                  !isDesktopNavbarCollapsed &&
                  !matchRoute({ to: "/settings", fuzzy: true })
                }
                isActive={!!matchRoute({ to: "/settings", fuzzy: true })}
              />
            </UnstyledButton>
            <UnstyledButton
              onClick={() => navigate({ to: "/notifications" })}
              title="Notifications"
              className={cn(
                isDesktopNavbarCollapsed &&
                  "focus:outline-none focus-visible:outline-none"
              )}
            >
              <BellIcon
                hasOutline={
                  !isDesktopNavbarCollapsed &&
                  !matchRoute({ to: "/notifications", fuzzy: true })
                }
                isActive={!!matchRoute({ to: "/notifications", fuzzy: true })}
              />
            </UnstyledButton>
          </Group>

          <Stack
            className={cn(
              "gap-[10px] overflow-y-auto no-scrollbar flex-grow",
              isDesktopNavbarCollapsed && "items-center"
            )}
          >
            {links.map((link) => {
              const isDistributorsLink = link.label === "Distributors";
              const isProductsLink = link.label === "Products";
              const isInnovationsLink = link.label === "Innovations";
              let isActive;

              if (isDistributorsLink) {
                const currentPath = window.location.pathname;
                isActive =
                  currentPath.startsWith("/distributors") ||
                  currentPath.startsWith("/add-distributor") ||
                  currentPath.startsWith("/edit-distributors") ||
                  currentPath.startsWith("/master-products");
              } else if (isProductsLink) {
                const currentPath = window.location.pathname;
                isActive =
                  currentPath.startsWith("/products") ||
                  currentPath.startsWith("/add-product") ||
                  currentPath.startsWith("/edit-product");
              } else if (isInnovationsLink) {
                const currentPath = window.location.pathname;
                isActive =
                  currentPath.startsWith("/innovations") ||
                  currentPath.startsWith("/add-innovation") ||
                  currentPath.startsWith("/edit-innovation");
              } else {
                isActive = matchRoute({ to: link.link, fuzzy: true });
              }
              const isHovered = hoveredLink === link.link;
              return (
                <Link
                  to={link.link}
                  key={link.label}
                  className={cn(
                    "flex items-center gap-x-2 text-white rounded-[10px] py-3 hover:text-[#00EBB2] transition-all ease-in-out duration-300",
                    isDesktopNavbarCollapsed
                      ? "px-2 justify-center w-full"
                      : "px-2",
                    isActive && "bg-white text-primary font-medium"
                  )}
                  title={isDesktopNavbarCollapsed ? link.label : undefined}
                  onMouseEnter={() => setHoveredLink(link.link)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <link.icon
                    fill={isActive ? "#002554" : isHovered ? "#00EBB2" : "#fff"}
                  />
                  {!isDesktopNavbarCollapsed && (
                    <span className="text-sm whitespace-nowrap">
                      {link.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </Stack>
        </AppShell.Navbar>
      )}
      <AppShell.Main>
        <div className="mx-5 lg:mx-10 mt-20 lg:mt-0">
          <Outlet />
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default Navbar;
