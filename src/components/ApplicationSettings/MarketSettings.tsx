import { useAddMarket } from "@/api/listManagement/markets/add-markets";
import { useDeleteMarket } from "@/api/listManagement/markets/delete-markets";
import { getMarkets } from "@/api/listManagement/markets/get-markets";
import { useUpdateMarket } from "@/api/listManagement/markets/update-markets";
import { Market, Meta } from "@/types";
import { Button, Group, Loader, Modal, Table, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import ExitIcon from "../Icons/ExitIcon";
import PencilIcon from "../Icons/PencilIcon";
import PlusIcon from "../Icons/PlusIcon";
import RefreshIcon from "../Icons/RefreshIcon";
import TrashIcon from "../Icons/TrashIcon";
import ErrorCard from "../Shared/ErrorCard";
import { textInputStyles } from "../Shared/Styles";

const MarketSettings = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [openedDelete, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [id, setId] = useState<number>(0);
  const [markets, setMarkets] = useState<
    Pick<Market, "id" | "name" | "created_at">[]
  >([]);
  const [meta, setMeta] = useState<Meta>();
  const [hasMore, setHasMore] = useState<boolean>(false);
  const addMarketMutation = useAddMarket({ mutationConfig: {} });
  const updateMarketMutation = useUpdateMarket({ mutationConfig: {} });
  const deleteMarketMutation = useDeleteMarket({ mutationConfig: {} });
  const form = useForm({
    initialValues: {
      name: "",
      region: "",
    },
  });
  const { data, isLoading, isError } = useQuery({
    queryKey: ["markets"],
    queryFn: () => getMarkets({ cursor: 1, page_size: 20 }),
  });

  useEffect(() => {
    setMarkets(data?.data || []);
    setMeta(data?.meta);
    setHasMore(data?.meta?.has_next || false);
    setId(0);
    form.reset();
  }, [data]);

  const fetchMarkets = async () => {
    if (!meta?.has_next) return;

    try {
      const response = await getMarkets({
        cursor: meta?.cursor || 1,
        page_size: 20,
      });
      setMarkets((prev) => [...prev, ...response.data]);
      setMeta(response.meta);
      setHasMore(response.meta.has_next);
    } catch (error) {
      console.error("Error fetching more forecasts:", error);
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
            Add New Market
          </Button>
        </Group>
        {isError ? (
          <ErrorCard errorText="an error occured fetching data" />
        ) : isLoading || !data ? (
          <div className="bg-white shadow-md rounded-lg p-6 mt-5">
            <div className="flex justify-center items-center mt-6">
              <Loader />
            </div>
          </div>
        ) : (
          <div className="relative border border-primary rounded-xl border-t-0">
            <InfiniteScroll
              dataLength={markets.length}
              next={fetchMarkets}
              hasMore={hasMore}
              loader={
                <div className="text-center py-4">
                  <Loader size="md" />
                </div>
              }
              endMessage={
                <p className="text-center text-gray-500 py-4">
                  No more markets to load.
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
                    {markets.map((element) => (
                      <Table.Tr key={element.id}>
                        <Table.Td className="first:rounded-es-xl">
                          {element.name}
                        </Table.Td>
                        <Table.Td
                          className="w-5 cursor-pointer"
                          onClick={() => {
                            setId(element.id);
                            form.setFieldValue("name", element.name);
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
      <Modal.Root
        opened={openedDelete}
        onClose={closeDelete}
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
                Delete Market {id}
              </h2>
              <div className="space-y-6">
                <Group justify="flex-end" mt="xl" gap={10}>
                  <Button
                    variant="outline"
                    className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    leftSection={<ExitIcon />}
                    onClick={() => {
                      closeDelete();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    leftSection={<RefreshIcon />}
                    type="submit"
                    variant="outline"
                    className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    onClick={() => {
                      deleteMarketMutation.mutate(id);
                      closeDelete();
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
                Add Market
              </h2>
              <div className="space-y-6">
                <TextInput
                  {...form.getInputProps("name")}
                  label="Name"
                  placeholder="Market Name"
                  type="text"
                  classNames={textInputStyles}
                  required
                />
                {/* <Select
                  {...form.getInputProps("region")}
                  label="Region"
                  placeholder="Select Region"
                  data={[
                    { value: "1", label: "South Africa" },
                    { value: "2", label: "North Africa" },
                  ]}
                  rightSection={<ChevronDownIcon />}
                  classNames={selectStyles}
                  clearable
                  searchable
                /> */}
                <Group justify="flex-end" mt="xl" gap={10}>
                  <Button
                    variant="outline"
                    className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    leftSection={<ExitIcon />}
                    onClick={() => {
                      close();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    leftSection={<RefreshIcon />}
                    type="submit"
                    variant="outline"
                    className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    onClick={() => {
                      if (id) {
                        updateMarketMutation.mutate({
                          data: {
                            name: form.getValues().name,
                            id: id,
                          },
                        });
                      } else {
                        addMarketMutation.mutate({ data: form.getValues() });
                      }
                      close();
                    }}
                  >
                    {id ? "Update" : " Add"}
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

export default MarketSettings;
