import {
  Badge,
  Button,
  Checkbox,
  Group,
  Loader,
  Select,
  Table,
} from "@mantine/core";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { selectStyles } from "../Shared/Styles";
import { getProductList } from "@/api/products/get-product-list";
import { useUpdateProductsStatus } from "@/api/products/update-product-status";
import { notifications } from "@mantine/notifications";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useIntersection } from "@mantine/hooks";
import { ProductListResponse } from "@/types";

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
            loading={updateStatusMutation.isPending}
          >
            Apply
          </Button>
        </Group>
      </Group>
      <div className="overflow-x-auto overflow-y-auto max-h-[1000px]">
        <Table
          verticalSpacing="sm"
          borderColor="transparent"
          striped="even"
          stripedColor="#F2F4F6"
          stickyHeader
        >
          <Table.Thead className="bg-primary h-14 sticky top-0 z-10">
            <Table.Tr>
              <Table.Th style={{ width: 40 }}>
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
              <Table.Th className="text-white text-sm font-medium">
                Product name
              </Table.Th>
              <Table.Th className="text-white text-sm font-medium">
                C1 Price
              </Table.Th>
              <Table.Th className="text-white text-sm font-medium">
                CSSP
              </Table.Th>
              <Table.Th className="text-white text-sm font-medium">
                Status
              </Table.Th>
              <Table.Th className="text-white text-sm font-medium">
                ICP EUR
              </Table.Th>
              <Table.Th className="text-white text-sm font-medium">
                ICP USD
              </Table.Th>
              <Table.Th className="text-white text-sm font-medium">
                French EUR
              </Table.Th>
              <Table.Th className="text-white text-sm font-medium">
                French USD
              </Table.Th>
              <Table.Th className="text-white text-sm font-medium">
                RRSP
              </Table.Th>
              <Table.Th className="text-white text-sm font-medium">
                Regional Billing Prices
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {products.map((product, index) => (
              <Table.Tr
                key={product.id}
                className={
                  selectedProducts.includes(product.id) ? "bg-blue-50" : ""
                }
                ref={index === products.length - 1 ? ref : undefined}
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
                    className="px-3 py-1 font-normal"
                  >
                    {product.pricing.status}
                  </Badge>
                </Table.Td>
                <Table.Td>{product.pricing.icp_eur}</Table.Td>
                <Table.Td>{product.pricing.icp_usd}</Table.Td>
                <Table.Td>{product.pricing.french_eur}</Table.Td>
                <Table.Td>{product.pricing.french_usd}</Table.Td>
                <Table.Td>{product.pricing.rrsp}</Table.Td>
                <Table.Td>{product.pricing.regional_billing_price}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        {isFetchingNextPage && (
          <div className="flex justify-center items-center py-4">
            <Loader size="sm" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsTable;
