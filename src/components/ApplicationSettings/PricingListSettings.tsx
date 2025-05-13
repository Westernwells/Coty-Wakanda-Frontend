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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import ExitIcon from "../Icons/ExitIcon";
import PencilIcon from "../Icons/PencilIcon";
import PlusIcon from "../Icons/PlusIcon";
import RefreshIcon from "../Icons/RefreshIcon";
import TrashIcon from "../Icons/TrashIcon";
import ErrorCard from "../Shared/ErrorCard";
import { selectStyles, textInputStyles } from "../Shared/Styles";
import { getPricingList } from "@/api/pricingList/get-pricing-list";
import { useUpdatePricingList } from "@/api/pricingList/update-pricing-list";
import { useDeletePricingList } from "@/api/pricingList/delete-pricing-list";
import { Link } from "@tanstack/react-router";
import { Trash2Icon } from "lucide-react";

interface PricingList {
  id: number;
  name: string;
  type: string;
  description: string | null;
  created_at: string;
}

const PricingListSettings = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [openedDelete, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [id, setId] = useState<number>(0);
  const [pricingList, setPricingList] = useState<PricingList[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [cursor, setCursor] = useState<number>(1);
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      name: "",
      type: "",
      description: "",
    },
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["pricing-list", cursor],
    queryFn: () => getPricingList({ cursor, page_size: 20 }),
  });

  console.log({ data });

  const updatePricingListMutation = useUpdatePricingList({
    mutationConfig: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["pricing-lists"] });
        close(); // Close modal on successful update
      },
    },
  });
  const deletePricingListMutation = useDeletePricingList({
    mutationConfig: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["pricing-lists"] });
        closeDelete(); // Close modal on successful delete
      },
    },
  });

  useEffect(() => {
    if (data?.data) {
      if (cursor === 1) {
        setPricingList(data.data);
      } else {
        setPricingList((prev) => [...prev, ...data.data]);
      }
      setHasMore(data.data.length === 20);
    }
  }, [data, cursor]);

  const fetchMorePricingList = async () => {
    if (hasMore) {
      setCursor((prev) => prev + 1);
    }
  };

  const pricingTypes = [
    { value: "luxury", label: "Luxury" },
    { value: "consumer beauty", label: "Consumer Beauty" },
  ];

  return (
    <div className="w-full">
      <div className=" p-6">
        <Group className="flex justify-end">
          <Button
            rightSection={<PlusIcon />}
            variant="default"
            className="border-none mb-5 bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
            component={Link}
            to="/settings/add-pricing-lists"
          >
            Add pricing list
          </Button>
        </Group>
        {isError ? (
          <ErrorCard errorText="An error occurred fetching data" />
        ) : isLoading ? (
          <div className="bg-white shadow-md rounded-lg p-6 mt-5">
            <div className="flex justify-center items-center mt-6">
              <Loader />
            </div>
          </div>
        ) : (
          <div className="relative border border-primary rounded-xl border-t-0">
            <InfiniteScroll
              dataLength={pricingList.length}
              next={fetchMorePricingList}
              hasMore={hasMore}
              loader={
                <div className="text-center py-4">
                  <Loader size="md" />
                </div>
              }
              endMessage={
                <p className="text-center text-gray-500 py-4">
                  No more pricing lists to load.
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
                      <Table.Th className="rounded-ss-xl text-xl">
                        Names
                      </Table.Th>
                      <Table.Th className="text-xl">Type</Table.Th>
                      <Table.Th className="text-xl">Description</Table.Th>
                      <Table.Th></Table.Th>
                      <Table.Th className="rounded-se-xl"></Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {pricingList.map((element) => (
                      <Table.Tr key={element.id} className="text-xl">
                        <Table.Td className="first:rounded-es-xl text-xl font-medium">
                          {element.name}
                        </Table.Td>
                        <Table.Td className="text-xl font-medium">
                          {element.type}
                        </Table.Td>
                        <Table.Td className="text-xl font-medium">
                          {element.description || "-"}
                        </Table.Td>
                        <Table.Td
                          className="w-5 cursor-pointer"
                          onClick={() => {
                            setId(element.id);
                            form.setValues({
                              name: element.name,
                              type: element.type,
                              description: element.description || "",
                            });
                            open();
                          }}
                        >
                          <PencilIcon />
                        </Table.Td>
                        <Table.Td
                          className="last:rounded-ee-xl w-5 text-center !pr-2 cursor-pointer"
                          onClick={() => {
                            setId(element.id);
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

      {/* Delete Modal */}
      <Modal.Root
        opened={openedDelete}
        onClose={() => {
          form.reset();
          setId(0);
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
                Delete Pricing List
              </h2>
              <p className="mb-4">
                Are you sure you want to delete this pricing list?
              </p>
              <div className="space-y-6">
                <Group justify="flex-end" mt="xl" gap={10}>
                  <Button
                    variant="outline"
                    className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    leftSection={<ExitIcon />}
                    onClick={closeDelete}
                  >
                    Cancel
                  </Button>
                  <Button
                    leftSection={<Trash2Icon className="size-4" />}
                    variant="outline"
                    className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    onClick={() => {
                      deletePricingListMutation.mutate(id);
                    }}
                    loading={deletePricingListMutation.isPending}
                  >
                    Delete
                  </Button>
                </Group>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>

      {/* Edit Modal */}
      <Modal.Root
        opened={opened}
        onClose={() => {
          form.reset();
          setId(0);
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
                Edit Pricing List
              </h2>
              <form
                onSubmit={form.onSubmit((values) => {
                  if (id) {
                    updatePricingListMutation.mutate({
                      data: {
                        id,
                        ...values,
                      },
                    });
                  }
                })}
              >
                <div className="space-y-6">
                  <TextInput
                    {...form.getInputProps("name")}
                    label="Name"
                    placeholder="Enter pricing list name"
                    classNames={textInputStyles}
                    required
                  />
                  <Select
                    {...form.getInputProps("type")}
                    label="Type"
                    placeholder="Select type"
                    data={pricingTypes}
                    rightSection={<ChevronDownIcon />}
                    classNames={selectStyles}
                    clearable
                    searchable
                    required
                  />
                  <TextInput
                    {...form.getInputProps("description")}
                    label="Description"
                    placeholder="Enter description"
                    classNames={textInputStyles}
                  />
                  <Group justify="flex-end" mt="xl" gap={10}>
                    <Button
                      variant="outline"
                      className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
                      leftSection={<ExitIcon />}
                      onClick={close}
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button
                      leftSection={<RefreshIcon />}
                      type="submit"
                      variant="outline"
                      className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
                      loading={updatePricingListMutation.isPending}
                    >
                      Update
                    </Button>
                  </Group>
                </div>
              </form>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </div>
  );
};

export default PricingListSettings;
