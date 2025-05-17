import { useDeleteCoefficient } from "@/api/coefficients/delete-coeff";
import { Button, Loader, Table, Modal, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Plus, TrashIcon } from "lucide-react";
import CoefficientsForm from "./CoefficientsForm";
import { getDistributorCoefficients } from "@/api/coefficients/get-coeff";
import { useQuery } from "@tanstack/react-query";
import { Coefficient } from "@/types";
import { useState } from "react";
import PencilIcon from "../Icons/PencilIcon";

function CoefficientsTable({ distributorId }: { distributorId: number }) {
  const [openedDelete, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const deleteCoefficientMutations = useDeleteCoefficient({});
  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [editOpened, setEditOpened] = useState(false);
  const [editData, setEditData] = useState<Coefficient | null>(null);

  // Fetch coefficients using useQuery directly
  const {
    data = { data: [] },
    isLoading,
    isError,
  } = useQuery<{ data: Coefficient[] }>({
    queryKey: ["coefficients", distributorId],
    queryFn: () => getDistributorCoefficients(distributorId),
    enabled: !!distributorId,
  });

  console.log(data);

  function handleDeleteClick(id: number) {
    setSelectedId(id);
    openDelete();
  }

  function handleConfirmDelete() {
    if (selectedId !== null) {
      deleteCoefficientMutations.mutate(
        {
          distributorId,
          coefficientId: selectedId,
        },
        {
          onSuccess: () => {
            setSelectedId(null);
            closeDelete();
          },
        }
      );
    }
  }

  function handleEditClick(coeff: Coefficient) {
    setEditData(coeff);
    setEditOpened(true);
  }

  return (
    <div>
      {deleteCoefficientMutations.isPending || isLoading ? (
        <Loader />
      ) : isError ? (
        <div className="text-red-500">Failed to load coefficients.</div>
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
                <Table.Th className="rounded-ss-xl">Type</Table.Th>
                <Table.Th>Pref value</Table.Th>
                <Table.Th>Non-pref value</Table.Th>
                <Table.Th />
                <Table.Th className="rounded-se-xl" />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {Array.isArray(data?.data) &&
                data.data.map((element: Coefficient, index: number) => (
                  <Table.Tr key={index}>
                    <Table.Td className="first:rounded-es-xl">
                      {element.type}
                    </Table.Td>
                    <Table.Td>{element.pref_value}</Table.Td>
                    <Table.Td>
                      {element.type === "regular"
                        ? element.non_pref_value
                        : "-"}
                    </Table.Td>
                    <Table.Td
                      className="w-5 text-center !pr-2 cursor-pointer"
                      onClick={() => handleEditClick(element)}
                    >
                      <PencilIcon />
                    </Table.Td>
                    <Table.Td
                      className="last:rounded-ee-xl w-5 text-center !pr-2 cursor-pointer"
                      onClick={() => handleDeleteClick(element.id)}
                    >
                      <TrashIcon className="size-5" />
                    </Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
      <CoefficientsForm
        opened={addOpened}
        close={closeAdd}
        data={null}
        distributorId={distributorId}
      />
      <CoefficientsForm
        opened={editOpened}
        close={() => {
          setEditOpened(false);
          setEditData(null);
        }}
        data={editData}
        distributorId={distributorId}
        onSuccess={() => {
          setEditOpened(false);
          setEditData(null);
        }}
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
      {/* Delete Modal */}
      <Modal.Root
        opened={openedDelete}
        onClose={() => {
          setSelectedId(null);
          closeDelete();
        }}
        withinPortal={false}
        trapFocus={false}
        className={
          openedDelete ? "absolute top-0 left-0 h-full w-full" : "hidden"
        }
      >
        <Modal.Overlay
          bg="linear-gradient(180deg, rgba(0, 37, 84, 0.7) 0%, rgba(0, 235, 178, 0.7) 100%)"
          blur={3}
        />
        <Modal.Content className="!items-center min-w-[40%]">
          <Modal.Body>
            <div className="bg-white rounded-2xl p-6 ">
              <h2 className="text-xl font-semibold mb-6 text-primary">
                Delete Coefficient
              </h2>
              <p className="mb-4">
                Are you sure you want to delete this coefficient?
              </p>
              <div className="space-y-6">
                <Group justify="flex-end" mt="xl" gap={10}>
                  <Button
                    variant="outline"
                    className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    onClick={() => {
                      setSelectedId(null);
                      closeDelete();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    onClick={handleConfirmDelete}
                    loading={deleteCoefficientMutations.isPending}
                  >
                    Delete
                  </Button>
                </Group>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </div>
  );
}

export default CoefficientsTable;
