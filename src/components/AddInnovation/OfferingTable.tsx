import { useFileUpload } from "@/api/products/upload-document";
import { dateToLocalString } from "@/lib/utils";
import {
  Button,
  Grid,
  Table,
  Modal,
  Collapse,
  TextInput,
  Select,
  Group,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import {
  PlusIcon,
  X,
  ChevronDown,
  ChevronUp,
  Upload,
  Trash2,
  Pencil,
} from "lucide-react";
import React, { useState } from "react";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import DateIcon from "../Icons/DateIcon";
import PencilIcon from "../Icons/PencilIcon";
import { FormField } from "../Shared/Form/Field";
import { FormSection } from "../Shared/Form/Section";
import { selectStyles, textInputStyles } from "../Shared/Styles";

interface Offering {
  number: string;
  icw: Date;
  ocd: Date;
  type: string;
  deck: string;
  market_deck: string;
  products: Array<{
    irc: string;
    currency: string;
    price: number;
  }>;
}

interface OfferingTableProps {
  offerings: Offering[];
  onAdd: (offering: Offering) => void;
  onEdit: (index: number, offering: Offering) => void;
  onDelete: (index: number) => void;
}

const OfferingTable: React.FC<OfferingTableProps> = ({
  offerings,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [offeringForm, setOfferingForm] = useState({
    number: "",
    deadline: new Date(),
    icw: new Date(),
    ocd: new Date(),
    type: "",
    deck: "",
    market_deck: "",
  });

  // File upload mutation
  const fileUploadMutation = useFileUpload({
    mutationConfig: {
      onSuccess: (response, variables) => {
        const fileType = variables.data.get("file_type") as string;
        const publicUrl = response?.data?.data?.public_url;

        if (publicUrl && fileType) {
          setOfferingForm((prev) => ({
            ...prev,
            [fileType]: publicUrl,
          }));
        }
      },
      onError: (error) => {
        console.error("File upload failed:", error);
      },
    },
  });

  const resetForm = () => {
    setOfferingForm({
      number: "",
      deadline: new Date(),
      icw: new Date(),
      ocd: new Date(),
      type: "",
      deck: "",
      market_deck: "",
    });
  };

  const handleAddOffering = () => {
    setModalMode("add");
    setEditingIndex(null);
    resetForm();
    openModal();
  };

  const handleEditOffering = (index: number) => {
    const offering = offerings[index];
    setModalMode("edit");
    setEditingIndex(index);
    setOfferingForm({
      number: offering.number,
      deadline: offering.icw, // Using ICW as deadline for now
      icw: offering.icw,
      ocd: offering.ocd,
      type: offering.type,
      deck: offering.deck,
      market_deck: offering.market_deck,
    });
    openModal();
  };

  const handleDeleteOffering = (index: number) => {
    setDeletingIndex(index);
    openDeleteModal();
  };

  const confirmDeleteOffering = () => {
    if (deletingIndex !== null) {
      onDelete(deletingIndex);
      setDeletingIndex(null);
      closeDeleteModal();
    }
  };

  const handleSubmitOffering = () => {
    const newOffering: Offering = {
      number: offeringForm.number,
      icw: offeringForm.icw,
      ocd: offeringForm.ocd,
      type: offeringForm.type,
      deck: offeringForm.deck,
      market_deck: offeringForm.market_deck,
      products: [],
    };

    if (modalMode === "edit" && editingIndex !== null) {
      onEdit(editingIndex, newOffering);
    } else {
      onAdd(newOffering);
    }

    resetForm();
    closeModal();
  };

  const toggleRow = (index: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleFileUpload = (file: File, fileType: "deck" | "market_deck") => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_type", fileType);

    fileUploadMutation.mutate({ data: formData });
  };

  return (
    <div className="bg-white rounded-2xl px-6 my-6">
      <FormSection title="Offerings">
        <div className="flex justify-end mb-4">
          <Button
            type="button"
            variant="outline"
            className="border-primary bg-transparent border-2 text-primary text-sm font-medium px-4 py-2 hover:bg-primary hover:text-white transition-all duration-300"
            leftSection={<PlusIcon size={16} />}
            onClick={handleAddOffering}
          >
            Add offering
          </Button>
        </div>

        <Grid>
          <Grid.Col span={12}>
            <div className="relative border border-primary rounded-xl overflow-hidden">
              <Table.ScrollContainer minWidth={768}>
                <Table verticalSpacing="md" borderColor="transparent">
                  <Table.Thead>
                    <Table.Tr className="bg-primary text-white">
                      <Table.Th className="text-white font-medium">
                        Offering number
                      </Table.Th>
                      <Table.Th className="text-white font-medium">
                        Forecast deadline
                      </Table.Th>
                      <Table.Th className="text-white font-medium">
                        Global ICW
                      </Table.Th>
                      <Table.Th className="text-white font-medium">
                        Global OCD
                      </Table.Th>
                      <Table.Th className="text-white font-medium">
                        Status
                      </Table.Th>
                      <Table.Th className="text-white font-medium">
                        Product amount
                      </Table.Th>
                      <Table.Th className="text-white font-medium w-16"></Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {offerings?.map((offering, index) => (
                      <React.Fragment key={index}>
                        <Table.Tr
                          className={`${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } hover:bg-gray-100 cursor-pointer transition-colors`}
                        >
                          <Table.Td className="font-medium">
                            {offering.number}
                          </Table.Td>
                          <Table.Td>{dateToLocalString(offering.icw)}</Table.Td>
                          <Table.Td>{dateToLocalString(offering.icw)}</Table.Td>
                          <Table.Td>{dateToLocalString(offering.ocd)}</Table.Td>
                          <Table.Td>
                            <span className="text-sm text-gray-600">
                              {offering.type || "Status example"}
                            </span>
                          </Table.Td>
                          <Table.Td className="font-medium">
                            {offering.products?.length || 0}
                          </Table.Td>
                          <Table.Td>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditOffering(index)}
                              >
                                <Pencil className="size-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteOffering(index)}
                              >
                                <Trash2 className="size-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleRow(index)}
                              >
                                {expandedRows.has(index) ? (
                                  <ChevronUp className="size-5" />
                                ) : (
                                  <ChevronDown className="size-5" />
                                )}
                              </button>
                            </div>
                          </Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                          <Table.Td colSpan={7} className="p-0">
                            <Collapse in={expandedRows.has(index)}>
                              <div className="p-4 bg-gray-50 border-t">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <div>
                                    <span className="text-sm font-medium text-gray-700">
                                      Type:
                                    </span>
                                    <p className="text-sm text-gray-600">
                                      {offering.type || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-700">
                                      Deck:
                                    </span>
                                    <p className="text-sm text-gray-600">
                                      {offering.deck
                                        ? "Uploaded"
                                        : "Not uploaded"}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-700">
                                      Market Deck:
                                    </span>
                                    <p className="text-sm text-gray-600">
                                      {offering.market_deck
                                        ? "Uploaded"
                                        : "Not uploaded"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </Collapse>
                          </Table.Td>
                        </Table.Tr>
                      </React.Fragment>
                    ))}
                    {(!offerings || offerings.length === 0) && (
                      <Table.Tr>
                        <Table.Td
                          colSpan={7}
                          className="text-center py-8 text-gray-500"
                        >
                          No offerings added yet. Click "Add offering" to get
                          started.
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </div>
          </Grid.Col>
        </Grid>
      </FormSection>

      {/* Add/Edit Offering Modal */}
      <Modal.Root
        opened={modalOpened}
        onClose={closeModal}
        withinPortal={false}
        trapFocus={false}
        className={
          modalOpened ? "absolute top-0 left-0 h-full w-full" : "hidden"
        }
      >
        <Modal.Overlay
          bg="linear-gradient(180deg, rgba(0, 37, 84, 0.7) 0%, rgba(0, 235, 178, 0.7) 100%)"
          blur={3}
        />
        <Modal.Content className="!items-center min-w-[70%]">
          <Modal.Body>
            <div className="bg-white rounded-2xl px-6 mt-6">
              <div className="space-y-6">
                <FormSection
                  title={modalMode === "add" ? "Add Offering" : "Edit Offering"}
                >
                  <Grid gutter={{ sm: 32, base: 16 }}>
                    <Grid.Col span={{ sm: 6, base: 12 }}>
                      <TextInput
                        value={offeringForm.number}
                        onChange={(e) =>
                          setOfferingForm((prev) => ({
                            ...prev,
                            number: e.target.value,
                          }))
                        }
                        placeholder="Offering Number"
                        label="Offering number"
                        classNames={textInputStyles}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ sm: 6, base: 12 }}>
                      <DateInput
                        value={offeringForm.deadline}
                        onChange={(date) =>
                          setOfferingForm((prev) => ({
                            ...prev,
                            deadline: date || new Date(),
                          }))
                        }
                        label="Forecast deadline"
                        valueFormat="YYYY MMM DD"
                        placeholder="Select date"
                        rightSection={<DateIcon />}
                        classNames={textInputStyles}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ sm: 4, base: 12 }}>
                      <DateInput
                        value={offeringForm.icw}
                        onChange={(date) =>
                          setOfferingForm((prev) => ({
                            ...prev,
                            icw: date || new Date(),
                          }))
                        }
                        label="Global ICW"
                        valueFormat="YYYY MMM DD"
                        placeholder="Select date"
                        rightSection={<DateIcon />}
                        classNames={textInputStyles}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ sm: 4, base: 12 }}>
                      <DateInput
                        value={offeringForm.ocd}
                        onChange={(date) =>
                          setOfferingForm((prev) => ({
                            ...prev,
                            ocd: date || new Date(),
                          }))
                        }
                        label="Global OCD"
                        valueFormat="YYYY MMM DD"
                        placeholder="Select date"
                        rightSection={<DateIcon />}
                        classNames={textInputStyles}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ sm: 4, base: 12 }}>
                      <Select
                        value={offeringForm.type}
                        onChange={(value) =>
                          setOfferingForm((prev) => ({
                            ...prev,
                            type: value || "",
                          }))
                        }
                        label="Type"
                        placeholder="Select type"
                        data={[
                          { value: "saleable", label: "Saleable" },
                          { value: "non saleable", label: "Non Saleable" },
                        ]}
                        rightSection={<ChevronDownIcon />}
                        classNames={selectStyles}
                        clearable
                      />
                    </Grid.Col>
                    <Grid.Col span={{ sm: 6, base: 12 }}>
                      <FormField label="Deck file">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept=".pdf,.ppt,.pptx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(file, "deck");
                                }
                              }}
                              style={{ display: "none" }}
                              id="offering_deck_input"
                            />
                            <Button
                              type="button"
                              variant="filled"
                              className="bg-primary hover:bg-primary/90 text-white"
                              onClick={() =>
                                document
                                  .getElementById("offering_deck_input")
                                  ?.click()
                              }
                              leftSection={<Upload size={16} />}
                            >
                              Upload Deck
                            </Button>
                          </div>
                          {offeringForm.deck && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <span>deck-file.pdf</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setOfferingForm((prev) => ({
                                    ...prev,
                                    deck: "",
                                  }))
                                }
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </FormField>
                    </Grid.Col>
                    <Grid.Col span={{ sm: 6, base: 12 }}>
                      <FormField label="Market deck file">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept=".pdf,.ppt,.pptx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(file, "market_deck");
                                }
                              }}
                              style={{ display: "none" }}
                              id="offering_market_deck_input"
                            />
                            <Button
                              type="button"
                              variant="filled"
                              className="bg-primary hover:bg-primary/90 text-white"
                              onClick={() =>
                                document
                                  .getElementById("offering_market_deck_input")
                                  ?.click()
                              }
                              leftSection={<Upload size={16} />}
                            >
                              Upload Market Deck
                            </Button>
                          </div>
                          {offeringForm.market_deck && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <span>market-deck-file.pdf</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setOfferingForm((prev) => ({
                                    ...prev,
                                    market_deck: "",
                                  }))
                                }
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </FormField>
                    </Grid.Col>
                  </Grid>
                </FormSection>

                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    onClick={closeModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-primary/90 hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    onClick={handleSubmitOffering}
                  >
                    {modalMode === "add" ? "Add Offering" : "Update Offering"}
                  </Button>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>

      {/* Delete Confirmation Modal */}
      <Modal.Root
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        withinPortal={false}
        trapFocus={false}
        className={
          deleteModalOpened ? "absolute top-0 left-0 h-full w-full" : "hidden"
        }
      >
        <Modal.Overlay
          bg="linear-gradient(180deg, rgba(0, 37, 84, 0.7) 0%, rgba(0, 235, 178, 0.7) 100%)"
          blur={3}
        />
        <Modal.Content className="!items-center min-w-[40%]">
          <Modal.Body>
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-6 text-primary">
                Delete Offering
              </h2>
              <p className="mb-4">
                Are you sure you want to delete this offering? This action
                cannot be undone.
              </p>
              <div className="space-y-6">
                <Group justify="flex-end" mt="xl" gap={10}>
                  <Button
                    variant="outline"
                    className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    onClick={closeDeleteModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-500 bg-red-500 border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-red-600 transition-all ease-in-out duration-300"
                    onClick={confirmDeleteOffering}
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
};

export default OfferingTable;
