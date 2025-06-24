import { Button, Group } from "@mantine/core";
import RoyaltiesTable from "./RoyaltiesTable";
import SystemSettings from "./SystemSettings";
import UsersTable from "./UsersTable";
import PlusIcon from "../Icons/PlusIcon";

const AdminSettings = () => {
  return (
    <div>
      <UsersTable />
      {/* <SystemSettings /> */}
      <RoyaltiesTable />
      <Group justify="end">
        <Button
          rightSection={<PlusIcon />}
          variant="default"
          className="border-none bg-primary border-s-e mt-4 rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
        >
          Update
        </Button>
      </Group>
    </div>
  );
};

export default AdminSettings;
