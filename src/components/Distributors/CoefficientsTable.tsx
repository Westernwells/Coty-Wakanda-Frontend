import { useDeleteCoefficient } from "@/api/coefficients/delete-coeff";
import { Coefficient } from "@/types";
import { Button, Group, Loader, Modal, Table } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import ExitIcon from "../Icons/ExitIcon";
import PencilIcon from "../Icons/PencilIcon";
import RefreshIcon from "../Icons/RefreshIcon";
import TrashIcon from "../Icons/TrashIcon";
import { Plus } from "lucide-react";
import CoefficientsForm from "./CoefficientsForm";

function CoefficientsTable({
  data,
  distributorId,
}: {
  data: Coefficient[] | [];
  distributorId: number;
}) {
  const [editData, setEditData] = useState<Coefficient>();
  const [pressedId, setPressedId] = useState<number | null>(null);
  const deleteCoefficientMutations = useDeleteCoefficient({});
  const [opened, { open, close }] = useDisclosure(false);
  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [
    openedDeleteModal,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  return (
    <div>
      {deleteCoefficientMutations.isPending ? (
        <Loader />
      ) : (
        <Table.ScrollContainer minWidth={768}>
          <Table
            verticalSpacing="sm"
            borderColor="transparent"
            striped="even"
            stripedColor="#F2F4F6"
          >
            <Table.Thead>
              <Table.Tr className="bg-primary text-white">
                <Table.Th className="rounded-ss-xl">
                  Co-efficient value{" "}
                </Table.Th>
                <Table.Th>Brand</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th></Table.Th>
                <Table.Th className="rounded-se-xl"></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.map((element, index) => (
                <Table.Tr key={index}>
                  <Table.Td className="first:rounded-es-xl">
                    {element.value}
                  </Table.Td>
                  <Table.Td>{element.brand.name}</Table.Td>
                  <Table.Td>{element.category.name}</Table.Td>
                  <Table.Td>{element.description ?? ""}</Table.Td>
                  <Table.Td
                    className="last:rounded-ee-xl text-center !pr-2 cursor-pointer"
                    onClick={() => {
                      setEditData(element);
                      open();
                    }}
                  >
                    <PencilIcon />
                  </Table.Td>
                  <Table.Td
                    className="last:rounded-ee-xl text-center !pr-2 cursor-pointer"
                    onClick={() => {
                      setPressedId(element.id);
                      openDeleteModal();
                    }}
                  >
                    <TrashIcon />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
      <Modal.Root
        opened={openedDeleteModal}
        onClose={closeDeleteModal}
        withinPortal={false}
        trapFocus={false}
        className={
          openedDeleteModal ? "absolute top-0 left-0 h-full w-full" : "hidden"
        }
      >
        <Modal.Overlay
          bg="linear-gradient(180deg, rgba(0, 37, 84, 0.7) 0%, rgba(0, 235, 178, 0.7) 100%)"
          blur={3}
        />
        <Modal.Content className="!items-center">
          <Modal.Body>
            <div className="bg-white rounded-2xl p-6 mt-6">
              <h2 className="text-xl text-center font-semibold mb-6 text-primary">
                Are you sure you want to delete this coefficient?
              </h2>
              <div className="space-y-6">
                <Group justify="center" w="100%" mt="xl" gap={10}>
                  <Button
                    variant="outline"
                    className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    leftSection={<ExitIcon />}
                    onClick={closeDeleteModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    leftSection={<RefreshIcon />}
                    variant="outline"
                    className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    // disabled={addCoefficientMutations.isPending || updateCoefficientMutations.isPending}
                    onClick={() => {
                      deleteCoefficientMutations.mutate({
                        coeffId: pressedId as number,
                        distributorId: distributorId,
                      });
                      closeDeleteModal();
                    }}
                  >
                    Delete
                  </Button>
                </Group>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
      <CoefficientsForm
        opened={opened}
        close={close}
        distributorId={distributorId ?? 0}
        data={editData}
      />
      <CoefficientsForm
        opened={addOpened}
        close={closeAdd}
        distributorId={distributorId ?? 0}
        data={null}
      />
      <div className="flex justify-start mb-4 pt-8">
        <Button
          variant="outline"
          className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
          leftSection={<Plus size={24} />}
          onClick={openAdd}
        >
          Add co-efficients
        </Button>
      </div>
    </div>
  );
}

export default CoefficientsTable;
