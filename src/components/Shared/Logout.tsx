import { Button } from "@mantine/core";
import LogoutIcon from "../Icons/LogoutIcon";
import { useUserStore } from "@/stores/userStore";
import { useNavigate } from "@tanstack/react-router";
import { useUserLogout } from "@/api/user/post-logout";
import { queryClient } from "@/main";

const Logout = () => {
    const signOut = useUserStore((state) => state.signOut);
    const navigate = useNavigate();
    const userLogout = useUserLogout({
        mutationConfig: {
            onSuccess: () => {
                signOut();
                navigate({ to: "/login" });
                queryClient.removeQueries();
            },
        },
    });
    return (
        <Button
            rightSection={<LogoutIcon />}
            variant="default"
            className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
            onClick={() => {
                userLogout.mutate(undefined);
            }}
        >
            Sign out
        </Button>
    );
};

export default Logout;
