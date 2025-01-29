import { Button } from "@mantine/core";
import LogoutIcon from "../Icons/LogoutIcon";
import { useUserStore } from "@/stores/userStore";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { userLogout } from "@/api/post-logout";
import { queryClient } from "@/main";

const Logout = () => {
  const signOut = useUserStore((state) => state.signOut);
  const navigate = useNavigate();
  const router = useRouter();
  return (
    <Button
      rightSection={<LogoutIcon />}
      variant="default"
      className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
      onClick={async () => {
        try {
          await userLogout();
        } catch (e) {
          console.log(e);
        } finally {
          queryClient.resetQueries();
          signOut();
        }
        router.invalidate().then(() => navigate({ to: "/login" }));
      }}
    >
      Sign out
    </Button>
  );
};

export default Logout;
