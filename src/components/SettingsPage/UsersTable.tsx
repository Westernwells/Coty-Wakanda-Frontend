import { Button, Table } from "@mantine/core";
import PencilIcon from "../Icons/PencilIcon";
import TrashIcon from "../Icons/TrashIcon";
import PlusIcon from "../Icons/PlusIcon";
import { FormSection } from "../Shared/Form/Section";
import { User } from "@/types";

const users: Partial<User>[] = [
  {
    id: 1,
    name: "heho",
    surname: "hehe",
    email: "haha@heh.coha",
    phone: "00000",
    role: "bebe",
  },
];

const UsersTable = () => {
  return (
    <FormSection title="Manage Users" className="mt-2 sm:mt-5">
      <div className="relative border border-primary rounded-xl border-t-0">
        <Table.ScrollContainer minWidth={768}>
          <Table
            verticalSpacing="sm"
            borderColor="transparent"
            striped="even"
            stripedColor="#F2F4F6"
          >
            <Table.Thead>
              <Table.Tr className="bg-primary text-white">
                <Table.Th className="rounded-ss-xl">Name</Table.Th>
                <Table.Th>Surname</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Contact number</Table.Th>
                <Table.Th>Department</Table.Th>
                <Table.Th></Table.Th>
                <Table.Th className="rounded-se-xl"></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((user, index) => (
                <Table.Tr key={index}>
                  <Table.Td className="first:rounded-es-xl">
                    {user.name}
                  </Table.Td>
                  <Table.Td>{user.surname}</Table.Td>
                  <Table.Td>{user.email}</Table.Td>
                  <Table.Td>{user.phone}</Table.Td>
                  <Table.Td>{user.role}</Table.Td>
                  <Table.Td onClick={() => console.log("press")}>
                    <PencilIcon />
                  </Table.Td>
                  <Table.Td
                    className="last:rounded-ee-xl text-center !pr-2 cursor-pointer"
                    onClick={() => console.log("press")}
                  >
                    <TrashIcon />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </div>
      <Button
        rightSection={<PlusIcon />}
        variant="default"
        className="border-none self-start bg-primary border-s-e mt-4 rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
      >
        Add new user
      </Button>
    </FormSection>
  );
};

export default UsersTable;
