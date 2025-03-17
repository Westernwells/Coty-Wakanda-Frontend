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

import AvatarIcon from "../Icons/AvatarIcon";
import BellIcon from "../Icons/BellIcon";
import BoxIcon from "../Icons/BoxIcon";
import ChartAreaIcon from "../Icons/ChartAreaIcon";
import DashboardIcon from "../Icons/DashboardIcon";
import FileDocumentIcon from "../Icons/FileDocumentIcon";
import GroupIcon from "../Icons/GroupIcon";
import LightBulbIcon from "../Icons/LightBulbIcon";
import Logo from "@/assets/logo.svg";
import SettingsIcon from "../Icons/SettingsIcon";
import ShoppingCart from "../Icons/ShoppingCartIcon";
import { cn } from "@/lib/utils";
import { useDisclosure } from "@mantine/hooks";
import { useUserStore } from "@/stores/userStore";

const Navbar = () => {
  const matchRoute = useMatchRoute();
  const isSignedIn = useUserStore((state) => state.isSignedIn);
  const role = useUserStore((state) => state.user?.role);
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const links =
    role === "admin"
      ? [
          { link: "/", label: "Dashboard", icon: DashboardIcon },
          { link: "/forecasting", label: "Forecasting", icon: ChartAreaIcon },
          { link: "/innovations", label: "Innovations", icon: LightBulbIcon },
          { link: "/distributors", label: "Distributors", icon: GroupIcon },
          { link: "/products", label: "Products", icon: ShoppingCart },
          {
            link: "/application-settings",
            label: "Settings",
            icon: LightBulbIcon,
          },
          { link: "orders", label: "Orders", icon: BoxIcon },
          { link: "reporting", label: "Reporting", icon: FileDocumentIcon },
        ]
      : [
          { link: "/", label: "Dashboard", icon: DashboardIcon },
          {
            link: "innovation-forecasts",
            label: "Innovation forecasts",
            icon: LightBulbIcon,
          },
          {
            link: "base-forecasts",
            label: "Base forecasts",
            icon: LightBulbIcon,
          },
          { link: "products", label: "Products", icon: ShoppingCart },
          { link: "orders", label: "Orders", icon: BoxIcon },
          { link: "stock-on-hand", label: "Stock On Hand", icon: BoxIcon },
          { link: "sales", label: "Sales", icon: BoxIcon },
        ];

  return (
    <AppShell
      navbar={{
        width: 256,
        breakpoint: "md",
        collapsed: { mobile: !opened },
      }}
      className={cn("w-full flex", opened && "block")}
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
            "bg-primary px-4 py-6 lg:py-10 lg:px-6 relative border-0 h-full md:flex min-h-screen",
            opened ? "flex w-full" : "hidden"
          )}
        >
          <CloseButton
            className="absolute text-white  right-4 md:hidden"
            size="lg"
            bg="transparent"
            onClick={toggle}
          />
          <div className="flex justify-center ">
            <img src={Logo} alt="Logo" />
          </div>
          <Group className="bg-white rounded-xl py-3 px-5 bg-opacity-10 flex justify-center  gap-x-3 flex-nowrap my-10">
            <UnstyledButton onClick={() => navigate({ to: "/profile" })}>
              <AvatarIcon />
            </UnstyledButton>
            <UnstyledButton onClick={() => navigate({ to: "/settings" })}>
              <SettingsIcon />
            </UnstyledButton>
            <UnstyledButton onClick={() => navigate({ to: "/notifications" })}>
              <BellIcon />
            </UnstyledButton>
          </Group>

          <Stack className="gap-[10px]">
            {links.map((link) => {
              const isActive = matchRoute({ to: link.link, fuzzy: true });
              return (
                <Link
                  to={link.link}
                  key={link.label}
                  className="flex items-center gap-x-2 text-white [&.active]:text-primary [&.active]:bg-white rounded-[10px] [&.active]:font-medium px-2 py-3 hover:bg-white hover:bg-opacity-10 transition-all ease-in-out duration-300"
                >
                  <link.icon fill={isActive ? "#002554" : "#fff"} />
                  <span className="text-sm">{link.label}</span>
                </Link>
              );
            })}
          </Stack>
        </AppShell.Navbar>
      )}
      <AppShell.Main
        className={cn("w-full container  pb-10", opened && "hidden")}
      >
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export default Navbar;
