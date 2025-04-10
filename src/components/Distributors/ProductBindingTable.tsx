import { useDeleteProductBinding } from "@/api/bindProducts/delete-binding";
import { getProductBindings } from "@/api/bindProducts/list-binding";
import { ProductBindingPricing } from "@/types";
import { Button, Group, Loader, Modal, Table } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ExitIcon from "../Icons/ExitIcon";
import PencilIcon from "../Icons/PencilIcon";
import RefreshIcon from "../Icons/RefreshIcon";
import TrashIcon from "../Icons/TrashIcon";
import ProductBindingForm from "./ProductBindingForm";

function ProductBindingsTable({ distributorId }: { distributorId: number }) {
    const [editData, setEditData] = useState<ProductBindingPricing>();
    const [pressedId, setPressedId] = useState<number | null>(null);
    const deleteProductBindingMutation = useDeleteProductBinding({});
    const { data, isLoading } = useQuery({
        queryKey: ["product-bindings", "distributor", distributorId],
        queryFn: () => getProductBindings(distributorId),
    });

    const [opened, { open, close }] = useDisclosure(false);
    const [
        openedDeleteModal,
        { open: openDeleteModal, close: closeDeleteModal },
    ] = useDisclosure(false);
    return (
        <div>
            {deleteProductBindingMutation.isPending || isLoading ? (
                <Loader />
            ) : (
                !!data && (
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
                                        Product Name
                                    </Table.Th>
                                    <Table.Th>ICP EUR</Table.Th>
                                    <Table.Th>ICP USD</Table.Th>
                                    <Table.Th>French EUR</Table.Th>
                                    <Table.Th>French USD</Table.Th>
                                    <Table.Th>RRSP</Table.Th>
                                    <Table.Th>Regional Billing Prices</Table.Th>
                                    <Table.Th>C1 Price</Table.Th>
                                    <Table.Th></Table.Th>
                                    <Table.Th className="rounded-se-xl"></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {data.data.map(
                                    (
                                        {
                                            pricing: element,
                                            material_description,
                                        },
                                        index
                                    ) => (
                                        <Table.Tr key={index}>
                                            <Table.Td className="first:rounded-es-xl">
                                                {material_description}
                                            </Table.Td>
                                            <Table.Td>
                                                {element.icp_eur}
                                            </Table.Td>
                                            <Table.Td>
                                                {element.icp_usd}
                                            </Table.Td>
                                            <Table.Td>
                                                {element.french_eur}
                                            </Table.Td>
                                            <Table.Td>
                                                {element.french_usd}
                                            </Table.Td>
                                            <Table.Td>{element.rrsp}</Table.Td>
                                            <Table.Td>
                                                {element.regional_billing_price}
                                            </Table.Td>
                                            <Table.Th>C1 Price</Table.Th>
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
                                                    setPressedId(
                                                        element.product_id
                                                    );
                                                    openDeleteModal();
                                                }}
                                            >
                                                <TrashIcon />
                                            </Table.Td>
                                        </Table.Tr>
                                    )
                                )}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                )
            )}

            <Modal.Root
                opened={openedDeleteModal}
                onClose={closeDeleteModal}
                withinPortal={false}
                trapFocus={false}
                className={
                    openedDeleteModal
                        ? "absolute top-0 left-0 h-full w-full"
                        : "hidden"
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
                                Are you sure you want to delete this product
                                binding?
                            </h2>
                            <div className="space-y-6">
                                <Group
                                    justify="center"
                                    w="100%"
                                    mt="xl"
                                    gap={10}
                                >
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
                                            deleteProductBindingMutation.mutate(
                                                {
                                                    productId:
                                                        pressedId as number,
                                                    distributorId:
                                                        distributorId,
                                                }
                                            );
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
            <ProductBindingForm
                opened={opened}
                close={close}
                distributorId={distributorId ?? 0}
                data={editData}
            />
        </div>
    );
}

export default ProductBindingsTable;
