import { getHouses } from "@/api/get-houses";
import { useAddLine } from "@/api/listManagement/lines/add-lines";
import { useDeleteLine } from "@/api/listManagement/lines/delete-lines";
import { getLines } from "@/api/listManagement/lines/get-lines";
import { useUpdateLine } from "@/api/listManagement/lines/update-lines";
import { Line, Meta } from "@/types";
import {
  Button,
  Group,
  Loader,
  Modal,
  Select,
  Table,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { toast } from "react-toastify";
import ExitIcon from "../Icons/ExitIcon";
import PencilIcon from "../Icons/PencilIcon";
import PlusIcon from "../Icons/PlusIcon";
import TrashIcon from "../Icons/TrashIcon";
import ErrorCard from "../Shared/ErrorCard";
import { selectStyles, textInputStyles } from "../Shared/Styles";

const LinesSettings = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [openedDelete, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [id, setId] = useState<number>(0);
  const [selectedLine, setSelectedLine] = useState<Line | null>(null);
  const [linesList, setLinesList] = useState<
  Line[]
  >([]);

  const [meta, setMeta] = useState<Meta>();
  const [hasMore, setHasMore] = useState<boolean>(false);
  const addLineMutation = useAddLine({ mutationConfig: {
    onSuccess: () => {
        toast.success("Line added successfully");
        setSelectedLine(null);
        close();
      },
      onError: (error) => {
        toast.error("Error adding line: " + error.message);
      },
  },  });
  const updateLineMutation = useUpdateLine({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Line updated successfully");
        setSelectedLine(null);
        close();
      },
    },
  });
  const deleteLineMutation = useDeleteLine({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Line deleted successfully");
        setSelectedLine(null);
        closeDelete();
      },
      onError: (error) => {
        toast.error("Error deleting line: " + error.message);
      },
    },
  });
  const form = useForm({
    initialValues: {
      name: "",
      house_id: "",
    },
  });

  const {
    data: lineData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["lines"],
    queryFn: () => getLines({ cursor: 1, page_size: 20 }),
  });

  const { data: housesData } = useQuery({
    queryKey: ["houses"],
    queryFn: () => getHouses(),
  });
 
  useEffect(() => {
    setLinesList(lineData?.data || []);
    setMeta(lineData?.meta);
    setHasMore(lineData?.meta?.has_next || false);
  setSelectedLine(null);
    form.reset();
  }, [lineData]);

  const fetchMoreLines = async () => {
    if (!meta?.has_next) return;

    try {
      const response = await getLines({
        cursor: meta?.cursor || 1,
        page_size: 20,
      });

      setLinesList((prev) => [...prev, ...response.data]);
      setMeta(response.meta);
      setHasMore(response.meta.has_next);
    } catch (error) {
      console.error("Error fetching more lines:", error);
      setHasMore(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white shadow-md rounded-b-lg p-6">
        <Group>
          <Button
            rightSection={<PlusIcon />}
            variant="default"
            className="border-none mb-5 bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
            onClick={open}
          >
            Add New Line
          </Button>
        </Group>
        {isError ? (
          <ErrorCard errorText="an error occured fetching data" />
        ) : isLoading || !lineData ? (
          <div className="bg-white shadow-md rounded-lg p-6 mt-5">
            <div className="flex justify-center items-center mt-6">
              <Loader />
            </div>
          </div>
        ) : (
          <div className="relative border border-primary rounded-xl border-t-0">
            <InfiniteScroll
              dataLength={linesList.length}
              next={fetchMoreLines}
              hasMore={hasMore}
              loader={
                <div className="text-center py-4">
                  <Loader size="md" />
                </div>
              }
              endMessage={
                <p className="text-center text-gray-500 py-4">
                  No more lines to load.
                </p>
              }
            >
              <Table.ScrollContainer minWidth={768}>
                <Table
                  verticalSpacing="sm"
                  borderColor="transparent"
                  striped="even"
                  stripedColor="#F2F4F6"
                >
                  <Table.Thead>
                    <Table.Tr className="bg-primary text-white">
                      <Table.Th className="rounded-ss-xl">Item</Table.Th>
                      <Table.Th></Table.Th>
                      <Table.Th className="rounded-se-xl"></Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {linesList?.map((element) => (
                      <Table.Tr key={element.id}>
                        <Table.Td className="first:rounded-es-xl">
                          {element.name}
                        </Table.Td>
                        <Table.Td
                          className="w-5 cursor-pointer"
                          onClick={() => {
                            setSelectedLine(element);
                            form.setFieldValue("name", element.name);
                            form.setFieldValue("house_id", String(element?.house?.id));
                            open();
                          }}
                        >
                          <PencilIcon />
                        </Table.Td>
                        <Table.Td
                          className="last:rounded-ee-xl w-5 text-center !pr-2 cursor-pointer"
                          onClick={() => {
                            setSelectedLine(element);
                            openDelete();
                          }}
                        >
                          <TrashIcon />
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </InfiniteScroll>
          </div>
        )}
      </div>
      <Modal.Root
        opened={openedDelete}
        onClose={() => {
          form.reset();
          setSelectedLine(null);
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
        <Modal.Content className="!items-center min-w-[70%]">
          <Modal.Body>
            <div className="bg-white rounded-2xl p-6 mt-6">
              <h2 className="text-xl font-semibold mb-6 text-primary">
                Delete Line "{selectedLine?.name}" with ID {selectedLine?.id}
              </h2>
              <div className="space-y-6">
                <Group justify="flex-end" mt="xl" gap={10}>
                  <Button
                    disabled={deleteLineMutation.isPending}
                    variant="outline"
                    className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300 disabled:bg-opacity-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                    leftSection={<ExitIcon />}
                    onClick={() => {
                      closeDelete();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                  disabled={deleteLineMutation.isPending}
                    leftSection={<TrashIcon className="w-full h-full" />}
                    type="submit"
                    variant="outline"
                    className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300 hover:text-primary disabled:bg-opacity-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                    onClick={() => {
                      if (!selectedLine?.id) {
                        toast.error("No line selected for deletion");
                        return;
                      }
                      deleteLineMutation.mutate(selectedLine?.id);
                      
                    }}
                  >
                    {deleteLineMutation.isPending ? "Deleting..." :"Delete"}
                  </Button>
                </Group>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
      <Modal.Root
        opened={opened}
        onClose={() => {
          form.reset();
          setId(0);
          setSelectedLine(null);
          close();
        }}
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
                {selectedLine?.id ? "Update Line" : "Add Line"}
              </h2>
              <div className="space-y-6">
                <TextInput
                  {...form.getInputProps("name")}
                  label="Name"
                  placeholder="Line Name"
                  type="text"
                  classNames={textInputStyles}
                  required
                />
                <Select
                  {...form.getInputProps("house_id")}
                  label="House Category"
                  placeholder="Select House"
                  data={
                    housesData?.data.map((house) => ({
                      value: house.id.toString(),
                      label: house.name,
                    })) || []
                  }
                  rightSection={<ChevronDownIcon />}
                  classNames={selectStyles}
                  clearable
                  searchable
                />
                <Group justify="flex-end" mt="xl" gap={10}>
                  <Button
                  disabled={addLineMutation.isPending || updateLineMutation.isPending}
                    variant="outline"
                    className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300 disabled:bg-opacity-50 disabled:text-gray-400 disabled::cursor-not-allowed"
                    leftSection={<ExitIcon />}
                    onClick={() => {
                      close();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    leftSection={selectedLine?.id ? <PencilIcon className="w-full h-full" /> : <PlusIcon className="w-full h-full"/>}
                    disabled={!form.isValid() || addLineMutation.isPending || updateLineMutation.isPending}
                    type="submit"
                    variant="outline"
                    className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 hover:text-primary transition-all ease-in-out duration-300 disabled:bg-opacity-50 disabled:text-gray-400 disabled::cursor-not-allowed"
                    onClick={() => {
                      if (selectedLine?.id) {
                        updateLineMutation.mutate({
                          data: {
                            ...form.getValues(),

                            id: selectedLine.id,
                          },
                        });
                      } else {
                        addLineMutation.mutate({
                          data: form.getValues(),
                        });
                      }
                    }}
                  >
                    {selectedLine?.id ? updateLineMutation.isPending? "Updating": "Update Line" : addLineMutation.isPending ? "Adding..." : "Add Line"}
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

export default LinesSettings;
