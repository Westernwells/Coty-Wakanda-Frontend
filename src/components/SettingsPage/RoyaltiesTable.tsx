import { Button, Group, Modal, Select, Table, TextInput } from "@mantine/core";
import { FormSection } from "../Shared/Form/Section";
import PencilIcon from "../Icons/PencilIcon";
import TrashIcon from "../Icons/TrashIcon";
import PlusIcon from "../Icons/PlusIcon";
import { useDisclosure } from "@mantine/hooks";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { selectStyles, textInputStyles } from "../Shared/Styles";
import ExitIcon from "../Icons/ExitIcon";
import RefreshIcon from "../Icons/RefreshIcon";
import { useForm } from "@mantine/form";
import { useQueries } from "@tanstack/react-query";
import { getBrands } from "@/api/get-brands";

const royalties = [
  {
    brand: "hel",
    percentage: "00",
  },
];

const RoyaltiesTable = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [{ data: brandsData }] = useQueries({
    queries: [{ queryKey: ["brands"], queryFn: () => getBrands() }],
  });
  const form = useForm({
    initialValues: {
      launch_id: "",
      offering_number: "",
      deadline: "",
      global_icw: "",
      global_ocd: "",
      type: "",
      offering_deck: "",
      sfm_deck: "",
    },
  });

  return (
    <FormSection title="Royalties" className="mt-2 sm:mt-5">
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
                <Table.Th className="rounded-ss-xl">Brand</Table.Th>
                <Table.Th>Percentage</Table.Th>
                <Table.Th></Table.Th>
                <Table.Th className="rounded-se-xl"></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {royalties.map((royalty, index) => (
                <Table.Tr key={index}>
                  <Table.Td className="first:rounded-es-xl">
                    {royalty.brand}
                  </Table.Td>
                  <Table.Td>{royalty.percentage}</Table.Td>
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
        onClick={open}
      >
        Add new royalty
      </Button>
      <Modal.Root
        opened={opened}
        onClose={close}
        withinPortal={false}
        trapFocus={false}
        className={opened ? "absolute top-0 left-0 h-full w-full" : "hidden"}
      >
        <Modal.Overlay
          bg="linear-gradient(180deg, rgba(0, 37, 84, 0.7) 0%, rgba(0, 235, 178, 0.7) 100%)"
          blur={3}
        />
        <Modal.Content className="!items-center min-w-[70%]">
          <Modal.Body>
            <div className="bg-white rounded-2xl p-6 mt-6">
              <h2 className="text-xl font-semibold mb-6 text-primary">
                Add Royalties
              </h2>
              <div className="space-y-6">
                <Select
                  {...form.getInputProps("brand")}
                  placeholder="Select brand"
                  data={
                    brandsData?.data?.map((brand) => ({
                      value: brand.id.toString(),
                      label: brand.name,
                    })) || []
                  }
                  rightSection={<ChevronDownIcon />}
                  classNames={selectStyles}
                  clearable
                  searchable
                />
                <TextInput
                  {...form.getInputProps("icp_cost")}
                  label="ICP Cost"
                  placeholder="23"
                  type="text"
                  classNames={textInputStyles}
                />
                <Group justify="flex-end" mt="xl" gap={10}>
                  <Button
                    variant="outline"
                    className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    leftSection={<ExitIcon />}
                    onClick={close}
                  >
                    Cancel
                  </Button>
                  <Button
                    leftSection={<RefreshIcon />}
                    type="submit"
                    variant="outline"
                    className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    // disabled={addCoefficientMutations.isPending}
                    onClick={() => {
                      console.log(form.getValues());
                      close();
                    }}
                  >
                    Add
                  </Button>
                </Group>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </FormSection>
  );
};

export default RoyaltiesTable;
