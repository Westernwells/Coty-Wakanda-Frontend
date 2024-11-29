import { Button } from "@mantine/core";
import LogoutIcon from "../Icons/LogoutIcon";

const Logout = () => {
    return (
        <Button
            rightSection={<LogoutIcon />}
            variant="default"
            className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
        >
            Sign out
        </Button>
    );
};

export default Logout;
