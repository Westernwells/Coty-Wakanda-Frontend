import { getProductList } from "@/api/products/get-product-list";
import { useUpdateProductsStatus } from "@/api/products/update-product-status";
import { ProductListResponse } from "@/types";
import {
  Badge,
  Button,
  Checkbox,
  Group,
  Loader,
  Select,
  Table,
  Modal,
} from "@mantine/core";
import { useDisclosure, useIntersection } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { selectStyles } from "../Shared/Styles";
import { RotateCw, XIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import InfiniteScroll from "react-infinite-scroll-component";

interface ProductsTableProps {
  distributorId: number;
  selectedProducts: number[];
  bulkActionStatus: string | null;
  onBulkActionChange: (value: string | null) => void;
  onApplyBulkAction: () => void;
  onSelectAllChange: (checked: boolean, products: number[]) => void;
  onRowCheckboxChange: (productId: number, checked: boolean) => void;
}

const ProductsTable = ({
  distributorId,
  selectedProducts,
  bulkActionStatus,
  onBulkActionChange,
  onApplyBulkAction,
  onSelectAllChange,
  onRowCheckboxChange,
}: ProductsTableProps) => {
  // Set up intersection observer
  const { ref, entry } = useIntersection({
    root: null,
    threshold: 1,
  });

  // Use infinite query instead of regular query
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<ProductListResponse>({
    queryKey: ["products", { distributorId }],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getProductList({
        distributorId,
        cursor: pageParam as number,
        pageSize: 20,
      });
      return response;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.meta.has_next ? lastPage.meta.cursor + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const updateStatusMutation = useUpdateProductsStatus({
    config: {
      onSuccess: () => {
        notifications.show({
          title: "Success",
          message: "Products status updated successfully",
          color: "green",
        });
        onApplyBulkAction(); // This will reset selection and bulk action status
      },
      onError: (error) => {
        notifications.show({
          title: "Error",
          message: error.message || "Failed to update products status",
          color: "red",
        });
      },
    },
  });

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedProduct, setSelectedProduct] = useState<
    ProductListResponse["data"][number] | null
  >(null);
  const [activeProduct, setActiveProduct] = useState<{
    id: number;
    currentStatus: "visible" | "hidden";
  } | null>(null);

  const navigate = useNavigate();

  // Combine all pages of products
  const products = infiniteData?.pages.flatMap((page) => page.data) || [];

  const productIds = products.map((product) => product.id);

  const allProductsSelected =
    selectedProducts.length === products.length && products.length > 0;
  const indeterminate =
    selectedProducts.length > 0 && selectedProducts.length < products.length;

  const handleBulkAction = () => {
    if (!bulkActionStatus || selectedProducts.length === 0) return;

    const status =
      bulkActionStatus === "Visible to distributor" ? "visible" : "hidden";

    updateStatusMutation.mutate({
      distributorId,
      products: selectedProducts,
      status,
    });
  };

  // Load more when last row is visible
  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 mt-6 flex justify-center items-center min-h-[200px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full space-y-7">
      <div className="bg-white rounded-2xl p-6 mt-6">
        <Group justify="space-between" mb="md">
          <Group>
            <Select
              placeholder="Bulk action"
              data={["Visible to distributor", "Hidden from distributor"]}
              size="sm"
              rightSection={<ChevronDownIcon />}
              classNames={{
                ...selectStyles,
                input: "h-10",
                root: "w-fit min-w-52 whitespace-nowrap",
              }}
              value={bulkActionStatus}
              onChange={onBulkActionChange}
              clearable
              disabled={updateStatusMutation.isPending}
            />
            <Button
              size="sm"
              className="border-none bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
              onClick={handleBulkAction}
              disabled={
                !bulkActionStatus ||
                selectedProducts.length === 0 ||
                updateStatusMutation.isPending
              }
              // loading={updateStatusMutation.isPending}
            >
              Apply
            </Button>
          </Group>
        </Group>
        <InfiniteScroll
          dataLength={products.length}
          next={fetchNextPage}
          hasMore={hasNextPage}
          loader={
            <div className="text-center py-4">
              <Loader size="md" />
            </div>
          }
          endMessage={
            <p className="text-center text-gray-500 py-4">
              No more products to load.
            </p>
          }
        >
          <Table
            verticalSpacing="sm"
            borderColor="transparent"
            striped="even"
            stripedColor="#F2F4F6"
          >
            <Table.Thead>
              <Table.Tr className="bg-primary text-white">
                <Table.Th className="w-[50px] rounded-ss-xl">
                  <Checkbox
                    checked={allProductsSelected}
                    indeterminate={indeterminate}
                    onChange={(event) =>
                      onSelectAllChange(event.currentTarget.checked, productIds)
                    }
                    classNames={{ input: "bg-white border-gray-300" }}
                    disabled={updateStatusMutation.isPending}
                  />
                </Table.Th>
                <Table.Th>Product name</Table.Th>
                <Table.Th>C1 Price</Table.Th>
                <Table.Th>CSSP</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th className="border-l border-l-gray-200">
                  ICP EUR
                </Table.Th>
                <Table.Th>ICP USD</Table.Th>
                <Table.Th>French EUR</Table.Th>
                <Table.Th>French USD</Table.Th>
                <Table.Th>RRSP</Table.Th>
                <Table.Th className="rounded-se-xl">
                  Regional Billing Prices
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {products.map((product, index) => (
                <Table.Tr
                  key={product.id}
                  className={`
                ${index % 2 === 0 ? "bg-white" : "bg-[#F2F4F6]"}
                "hover:bg-primary/10"
              `}
                >
                  <Table.Td>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onChange={(event) =>
                        onRowCheckboxChange(
                          product.id,
                          event.currentTarget.checked
                        )
                      }
                      classNames={{ input: "bg-white border-gray-300" }}
                      disabled={updateStatusMutation.isPending}
                    />
                  </Table.Td>
                  <Table.Td>{product.material_description}</Table.Td>
                  <Table.Td>{product.pricing.c1}</Table.Td>
                  <Table.Td>{product.pricing.cssp}</Table.Td>
                  <Table.Td>
                    <Badge
                      styles={{
                        root: {
                          backgroundColor:
                            product.pricing.status === "hidden"
                              ? "#FF8383"
                              : "#2196F3",
                        },
                      }}
                      variant="filled"
                      radius="xl"
                      className="px-3 py-1 font-normal cursor-pointer"
                      onClick={() => {
                        setActiveProduct({
                          id: product.id,
                          currentStatus: product.pricing.status as
                            | "visible"
                            | "hidden",
                        });
                        open();
                      }}
                    >
                      {product.pricing.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td className="border-l border-l-gray-200">
                    {product.pricing.icp_eur}
                  </Table.Td>
                  <Table.Td>{product.pricing.icp_usd}</Table.Td>
                  <Table.Td>{product.pricing.french_eur}</Table.Td>
                  <Table.Td>{product.pricing.french_usd}</Table.Td>
                  <Table.Td>{product.pricing.rrsp}</Table.Td>
                  <Table.Td>{product.pricing.regional_billing_price}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </InfiniteScroll>
      </div>

      <div className="flex items-center justify-end gap-x-2">
        <Button
          leftSection={<XIcon />}
          onClick={() => {
            navigate({ to: "/distributors" });
          }}
          variant="outline"
          className="border-primary  border-s-e rounded-ee-xl text-primary text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
        >
          Cancel
        </Button>
        <Button
          leftSection={<RotateCw />}
          variant="default"
          className="border-none w-38 bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
          onClick={() => {}}
        >
          Update
        </Button>
      </div>

      <Modal.Root
        opened={opened}
        onClose={() => {
          close();
          setActiveProduct(null);
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
                Are you sure you want to change the status of this product?
              </h2>

              <Group justify="flex-end" mt="xl" gap={10}>
                <Button
                  variant="outline"
                  className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40"
                  onClick={() => {
                    close();
                    setActiveProduct(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:text-primary hover:bg-opacity-40"
                  onClick={() => {
                    if (!activeProduct) return;

                    const newStatus =
                      activeProduct.currentStatus === "hidden"
                        ? "visible"
                        : "hidden";

                    updateStatusMutation.mutate({
                      distributorId,
                      productId: activeProduct.id,
                      status: newStatus,
                    });

                    close();
                    setActiveProduct(null);
                  }}
                >
                  Confirm
                </Button>
              </Group>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </div>
  );
};

export default ProductsTable;
