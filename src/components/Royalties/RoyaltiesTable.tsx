import { getBrands } from "@/api/get-brands";
import { useAddRoyalty } from "@/api/royalties/add-royalty";
import { useDeleteRoyalty } from "@/api/royalties/delete-royalty";
import { getRoyalties } from "@/api/royalties/get-royalties";
import { useUpdateRoyalty } from "@/api/royalties/update-royalty";
import { Meta, Royalty } from "@/types";
import {
  Button,
  Group,
  Loader,
  Modal,
  NumberInput,
  Select,
  Table,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { z } from "zod";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import ExitIcon from "../Icons/ExitIcon";
import PencilIcon from "../Icons/PencilIcon";
import PlusIcon from "../Icons/PlusIcon";
import RefreshIcon from "../Icons/RefreshIcon";
import TrashIcon from "../Icons/TrashIcon";
import ErrorCard from "../Shared/ErrorCard";
import { selectStyles } from "../Shared/Styles";

const RoyaltiesTable = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [openedDelete, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [id, setId] = useState<number>(0);
  const [royalties, setRoyalties] = useState<Royalty[]>([]);
  const [meta, setMeta] = useState<Meta>();
  const [hasMore, setHasMore] = useState<boolean>(false);

  const { data: brandsData } = useQuery({
    queryKey: ["brands"],
    queryFn: () => getBrands(),
  });
  const addRoyaltyMutation = useAddRoyalty({ mutationConfig: {} });
  const updateRoyaltyMutation = useUpdateRoyalty({
    mutationConfig: {},
  });
  const deleteRoyaltyMutation = useDeleteRoyalty({
    mutationConfig: {
      onSuccess: () => setId(0),
    },
  });
  const form = useForm<
    Pick<Royalty, "value" | "freight"> & { brand_id: string }
  >({
    initialValues: {
      brand_id: "",
      value: 0,
      freight: 0,
    },
    validate: zodResolver(
      z.object({
        value: z.preprocess(
          (val) => (typeof val === "string" ? parseFloat(val) : val),
          z
            .number({
              required_error: "Value is required",
              invalid_type_error: "Value is required",
            })
            .gt(0, "Value must be greater than 0")
            .lt(100, "Value must be less than 100")
        ),
        freight: z.preprocess(
          (val) => (typeof val === "string" ? parseFloat(val) : val),
          z
            .number({
              required_error: "Freight is required",
              invalid_type_error: "Freight is required",
            })
            .gt(0, "Freight must be greater than 0")
            .lt(100, "Value must be less than 100")
        ),
        brand_id: z.preprocess(
          (val) => (typeof val === "string" ? parseInt(val) : val),
          z.number({
            required_error: "Brand is required",
            invalid_type_error: "Brand is required",
          })
        ),
      })
    ),
  });
  const { data, isLoading, isError } = useQuery({
    queryKey: ["royalties"],
    queryFn: () => getRoyalties({ cursor: 1, page_size: 20 }),
  });
  useEffect(() => {
    setRoyalties(data?.data || []);
    setMeta(data?.meta);
    setHasMore(data?.meta?.has_next || false);
    setId(0);
    form.reset();
  }, [data]);

  const fetchRoyalties = async () => {
    if (!meta?.has_next) return;

    try {
      const response = await getRoyalties({
        cursor: meta?.cursor || 1,
        page_size: 20,
      });
      setRoyalties((prev) => [...prev, ...response.data]);
      setMeta(response.meta);
      setHasMore(response.meta.has_next);
    } catch (error) {
      console.error("Error fetching more Royalties:", error);
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
            Add New Royalty
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
              dataLength={royalties.length}
              next={fetchRoyalties}
              hasMore={hasMore}
              loader={
                <div className="text-center py-4">
                  <Loader size="md" />
                </div>
              }
              endMessage={
                <p className="text-center text-gray-500 py-4">
                  No more Royalties to load.
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
                      <Table.Th className="rounded-ss-xl">House</Table.Th>
                      <Table.Th>
                        % of NR &#40;total House&#41; FY24 Plan Proposal
                      </Table.Th>
                      <Table.Th>
                        % of NR &#40;total House&#41; FY25 Plan Proposal
                      </Table.Th>
                      <Table.Th></Table.Th>
                      <Table.Th className="rounded-se-xl"></Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {royalties.map((element) => (
                      <Table.Tr key={element.id}>
                        <Table.Td className="first:rounded-es-xl">
                          {element.brand.name}
                        </Table.Td>
                        <Table.Td>{element.value}</Table.Td>
                        <Table.Td>{element.freight}</Table.Td>
                        <Table.Td
                          className="w-5 cursor-pointer"
                          onClick={() => {
                            setId(element.id);
                            form.setValues({
                              brand_id: element.brand.id.toString(),
                              freight: element.freight,
                              value: element.value,
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
                Delete Royalty {id}
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
                      deleteRoyaltyMutation.mutate(id);
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
        onClose={() => {
          if (id) {
            form.reset();
            setId(0);
          }
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
                Add Royalty
              </h2>
              <div className="space-y-6">
                <Select
                  {...form.getInputProps("brand_id")}
                  label="Brand"
                  placeholder="Select Brand"
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
                <NumberInput
                  {...form.getInputProps("value")}
                  label="Value"
                  placeholder="Value %"
                  suffix="%"
                  defaultValue={100}
                  hideControls
                  allowNegative={false}
                  min={0}
                  max={100}
                />
                <NumberInput
                  {...form.getInputProps("freight")}
                  label="Freight"
                  placeholder="Freight %"
                  suffix="%"
                  defaultValue={100}
                  hideControls
                  allowNegative={false}
                  min={0}
                  max={100}
                />

                <Group justify="flex-end" mt="xl" gap={10}>
                  <Button
                    variant="outline"
                    className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    leftSection={<ExitIcon />}
                    onClick={() => {
                      if (id) {
                        setId(0);
                        form.reset();
                      }
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
                      if (!form.validate().errors.length) return;
                      if (id) {
                        updateRoyaltyMutation.mutate({
                          data: {
                            ...form.getValues(),
                            id: id,
                          },
                        });
                        setId(0);
                        form.reset();
                      } else {
                        addRoyaltyMutation.mutate({ data: form.getValues() });
                        form.reset();
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

export default RoyaltiesTable;
