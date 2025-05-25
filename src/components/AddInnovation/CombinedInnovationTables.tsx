import { Product } from "@/types";
import React, { useState } from "react";
import { Loader, Table, Checkbox, Button, Modal, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import InfiniteScroll from "react-infinite-scroll-component";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateOfferingProduct } from "@/api/innovations/offerings/products/update-product";
import { useDeleteOfferingProduct } from "@/api/innovations/offerings/products/delete-product";
import { PriceBenchmarkModal } from "../AddInnovation/price-benchmark/PriceBenchmarkModal";

interface CombinedInnovationTablesProps {
  // Products table props
  products: Product[];
  isEdit: boolean;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  onProductSelect?: (product: Product) => void;
  brandOptions: { value: string; label: string }[];
  brandPillarOptions: { value: string; label: string }[];
  onBulkUpdate?: (products: Product[]) => void;
  onDeleteProducts?: (productIds: number[]) => void;
  selectedProducts?: number[];
  onSelectedProductsChange?: (productIds: number[]) => void;
  isDeleteMode: boolean;

  // Distributor prices props
  distributors: {
    id: number;
    name: string;
    data: {
      irc: string;
      billing_price: number;
      rrsp: number;
    }[];
  }[];
  tableHeader: string[];
  tableFields: string[];
  onPriceEdit?: (irc: string, price: number) => void;
  onRRSPEdit?: (irc: string, rrsp: number) => void;

  // New props
  innovationId: string;
  offeringId: string;

  // Local edit and delete props
  onLocalEdit?: (product: Product) => void;
  onLocalDelete?: (product: Product) => void;
}

function CombinedInnovationTables({
  // Products table props
  products,
  isEdit,
  setIsEdit,
  onProductSelect,
  brandOptions,
  brandPillarOptions,
  onBulkUpdate,
  onDeleteProducts,
  selectedProducts = [],
  onSelectedProductsChange,
  isDeleteMode,

  // Distributor prices props
  distributors,
  tableHeader,
  tableFields,
  onPriceEdit,
  onRRSPEdit,

  // New props
  innovationId,
  offeringId,

  // Local edit and delete props
  onLocalEdit,
  onLocalDelete,
}: CombinedInnovationTablesProps) {
  const [currentDistributorIndex, setCurrentDistributorIndex] = useState(0);
  const [editingPrice, setEditingPrice] = useState<{
    irc: string;
    price: number;
  } | null>(null);
  const [editingRRSP, setEditingRRSP] = useState<{
    irc: string;
    rrsp: number;
  } | null>(null);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [benchmarkedProducts, setBenchmarkedProducts] = useState<Set<number>>(
    new Set()
  );

  const [isBenchmarkModalOpen, setIsBenchmarkModalOpen] = useState(false);
  const [benchmarkProduct, setBenchmarkProduct] = useState<Product | null>(
    null
  );

  const currentDistributor = distributors[currentDistributorIndex] || null;

  const updateProductMutation = useUpdateOfferingProduct({
    mutationConfig: {
      onSuccess: () => {
        setEditingProduct(null);
      },
      onError: (error) => {
        console.error("Failed to update product:", error);
      },
    },
  });

  const deleteProductMutation = useDeleteOfferingProduct({
    mutationConfig: {
      onSuccess: () => {
        setIsDeletingProduct(false);
      },
      onError: (error) => {
        console.error("Failed to delete product:", error);
      },
    },
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (!onSelectedProductsChange || !isDeleteMode) return;

    const newSelectedProducts = e.currentTarget.checked
      ? products.map((product) => product.id)
      : [];

    onSelectedProductsChange(newSelectedProducts);
  };

  const handleCheckboxChange = (
    e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
    productId: number
  ) => {
    e.stopPropagation();
    if (!onSelectedProductsChange || !isDeleteMode) return;

    const newSelectedProducts = selectedProducts.includes(productId)
      ? selectedProducts.filter((id) => id !== productId)
      : [...selectedProducts, productId];

    onSelectedProductsChange(newSelectedProducts);
  };

  const handleBenchmarkToggle = (product: Product) => {
    const newBenchmarkedProducts = new Set(benchmarkedProducts);
    if (newBenchmarkedProducts.has(product.id)) {
      newBenchmarkedProducts.delete(product.id);
    } else {
      setBenchmarkProduct(product);
      setIsBenchmarkModalOpen(true);
    }
    setBenchmarkedProducts(newBenchmarkedProducts);
  };

  const handleRowClick = (e: React.MouseEvent, product: Product) => {
    if ((e.target as HTMLElement).closest(".checkbox-cell")) {
      return;
    }
    onProductSelect?.(product);
  };

  const nextDistributor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDistributorIndex(
      (prev) => (prev + 1) % (distributors.length || 1)
    );
  };

  const prevDistributor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDistributorIndex(
      (prev) =>
        (prev - 1 + (distributors.length || 1)) % (distributors.length || 1)
    );
  };

  const handleEditProduct = (product: Product) => {
    if (isEdit) {
      // Remote edit
      setEditingProduct(product);
      updateProductMutation.mutate({
        innovationId,
        offeringId,
        id: product.id,
        data: {
          irc: product.irc,
          material_description: product.material_description,
          icp_cost: Number(product.icp_eur) || Number(product.icp_usd) || 0,
          price: Number(product.icp_eur) || Number(product.icp_usd) || 0,
          currency: product.icp_eur ? "EUR" : "USD",
          brand_id: product.brand.id.toString(),
          sub_brand_id: product.brand_pillar?.id.toString(),
          product_type: product.product_type as "saleable" | "non-saleable",
          pref: product.pref as "pref" | "non-pref",
          grouping: product.grouping.toString() as "1" | "2" | "3",
        },
      });
    } else {
      // Local edit - Pass the product data to parent component
      const editData = {
        ...product,
        // Keep original numeric values
        icp_eur: product.icp_eur,
        icp_usd: product.icp_usd,
        grouping: product.grouping,
        // Add additional fields for editing
        currency: product.icp_eur ? "EUR" : "USD",
        brand_id: product.brand.id.toString(),
        sub_brand_id: product.brand_pillar?.id.toString(),
        product_type: product.product_type as "saleable" | "non-saleable",
        pref: product.pref as "pref" | "non-pref",
      };
      onLocalEdit?.(editData);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    openDeleteModal();
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setIsDeletingProduct(true);
      await deleteProductMutation.mutateAsync({
        innovationId,
        offeringId,
        productId: productToDelete.id,
      });

      // Call onLocalDelete if provided
      onLocalDelete?.(productToDelete);

      closeDeleteModal();
      setProductToDelete(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setIsDeletingProduct(false);
    }
  };

  if (!products.length) {
    return <p>No products available</p>;
  }

  console.log("products", products);

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-grow overflow-y-auto max-h-[calc(100vh-28rem)]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-primary">Product list</h3>
          </div>
          <div className="flex items-center gap-4">
            {currentDistributor && (
              <>
                <h3 className="text-lg font-semibold text-primary">
                  Distributor Prices
                </h3>
                <span
                  className="text-sm font-medium text-gray-600 truncate max-w-xs"
                  title={currentDistributor.name}
                >
                  {currentDistributor.name}
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={prevDistributor}
                    className="px-2 py-1 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    disabled={distributors.length <= 1}
                    type="button"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextDistributor}
                    className="px-2 py-1 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    disabled={distributors.length <= 1}
                    type="button"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <InfiniteScroll
          dataLength={products.length}
          next={() => {}}
          hasMore={false}
          loader={
            <div className="text-center py-4">
              <Loader size="md" />
            </div>
          }
          className="relative border border-primary rounded-xl"
          scrollableTarget="products-scroll-container"
        >
          <Table.ScrollContainer minWidth={1200}>
            <Table
              verticalSpacing="sm"
              borderColor="transparent"
              striped="even"
              stripedColor="#F2F4F6"
            >
              <Table.Thead>
                <Table.Tr className="bg-primary text-white">
                  <Table.Th className="rounded-ss-xl checkbox-cell w-[120px]">
                    <div className="flex items-center gap-2">
                      {isDeleteMode && (
                        <Checkbox
                          color="white"
                          checked={
                            selectedProducts.length === products.length &&
                            products.length > 0
                          }
                          indeterminate={
                            selectedProducts.length > 0 &&
                            selectedProducts.length < products.length
                          }
                          onChange={handleSelectAll}
                          styles={{
                            input: {
                              backgroundColor: "transparent",
                              borderColor: "white",
                              "&:checked": {
                                backgroundColor: "white",
                                borderColor: "white",
                              },
                              cursor: "pointer",
                            },
                          }}
                        />
                      )}
                      <span className="text-white">Actions</span>
                    </div>
                  </Table.Th>
                  <Table.Th> Benchmarked</Table.Th>
                  <Table.Th>IRC</Table.Th>
                  <Table.Th>Brand</Table.Th>
                  <Table.Th>Brand Type</Table.Th>
                  <Table.Th>Brand Pillar</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>ICP EU</Table.Th>
                  <Table.Th>ICP USD</Table.Th>
                  <Table.Th>Pref Value</Table.Th>

                  <Table.Th className="border-r border-gray-200">
                    Status
                  </Table.Th>
                  {/* Distributor Price Columns */}
                  <Table.Th>Price</Table.Th>
                  <Table.Th className="rounded-se-xl">RRSP</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {products.map((product, index) => {
                  const distributorPrice = currentDistributor?.data.find(
                    (price) => price.irc === product.irc
                  );

                  return (
                    <Table.Tr
                      key={product.id}
                      onClick={(e) => handleRowClick(e, product)}
                      className="hover:bg-gray-50"
                    >
                      <Table.Td className="checkbox-cell w-[120px]">
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isDeleteMode && (
                            <Checkbox
                              checked={selectedProducts.includes(product.id)}
                              onChange={(e) =>
                                handleCheckboxChange(e, product.id)
                              }
                              styles={{
                                input: {
                                  cursor: "pointer",
                                },
                              }}
                            />
                          )}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="subtle"
                              size="xs"
                              className="p-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProduct(product);
                              }}
                              disabled={
                                isEdit && updateProductMutation.isPending
                              }
                              title={
                                isEdit
                                  ? "Edit product (Remote)"
                                  : "Edit product (Local)"
                              }
                            >
                              <Pencil
                                size={14}
                                className={cn("text-primary", {
                                  "opacity-50":
                                    isEdit && updateProductMutation.isPending,
                                })}
                              />
                            </Button>
                            <Button
                              variant="subtle"
                              size="xs"
                              className="p-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProduct(product);
                              }}
                              disabled={
                                isEdit && deleteProductMutation.isPending
                              }
                              title={
                                isEdit
                                  ? "Delete product (Remote)"
                                  : "Delete product (Local)"
                              }
                            >
                              <Trash2
                                size={14}
                                className={cn("text-primary", {
                                  "opacity-50":
                                    isEdit && deleteProductMutation.isPending,
                                })}
                              />
                            </Button>
                          </div>
                        </div>
                      </Table.Td>
                      <Table.Td>
                        <Checkbox
                          checked={benchmarkedProducts.has(product.id)}
                          onChange={() => handleBenchmarkToggle(product)}
                          styles={{
                            input: {
                              cursor: "pointer",
                              backgroundColor: benchmarkedProducts.has(
                                product.id
                              )
                                ? "#0025FF"
                                : "transparent",
                              borderColor: "#0025FF",
                              "&:checked": {
                                backgroundColor: "#0025FF",
                                borderColor: "#0025FF",
                              },
                            },
                          }}
                        />
                      </Table.Td>
                      <Table.Td>{product.irc}</Table.Td>
                      <Table.Td>{product.brand.name}</Table.Td>
                      <Table.Td>{product.brand.type}</Table.Td>
                      <Table.Td>{product.brand_pillar?.name || "-"}</Table.Td>
                      <Table.Td>{product.material_description}</Table.Td>
                      <Table.Td>{product.icp_eur}</Table.Td>
                      <Table.Td>{product.icp_usd}</Table.Td>
                      <Table.Td>
                        <span className="text-white bg-blue px-[10px] py-0.5 rounded-full text-nowrap">
                          {product.pref}
                        </span>
                      </Table.Td>
                      <Table.Td className="border-r border-gray-200">
                        {product.status && (
                          <span className="text-white bg-blue px-[10px] py-0.5 rounded-full text-nowrap">
                            {product.status}
                          </span>
                        )}
                      </Table.Td>

                      {/* Distributor Price Cells */}
                      <Table.Td>
                        {distributorPrice ? (
                          editingPrice?.irc === product.irc ? (
                            <input
                              type="number"
                              value={editingPrice.price}
                              onChange={(e) => {
                                const newPrice = parseFloat(e.target.value);
                                if (!isNaN(newPrice)) {
                                  setEditingPrice({
                                    ...editingPrice,
                                    price: newPrice,
                                  });
                                }
                              }}
                              onBlur={() => {
                                if (editingPrice) {
                                  onPriceEdit?.(
                                    editingPrice.irc,
                                    editingPrice.price
                                  );
                                }
                                setEditingPrice(null);
                              }}
                              autoFocus
                              className="w-20 border border-gray-300 rounded px-1 py-0.5 text-sm"
                              step="0.01"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPrice({
                                  irc: product.irc,
                                  price: distributorPrice.billing_price,
                                });
                              }}
                              className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded min-h-[22px]"
                            >
                              ${distributorPrice.billing_price.toFixed(2)}
                            </div>
                          )
                        ) : (
                          "-"
                        )}
                      </Table.Td>
                      <Table.Td>
                        {distributorPrice ? (
                          editingRRSP?.irc === product.irc ? (
                            <input
                              type="number"
                              value={editingRRSP.rrsp}
                              onChange={(e) => {
                                const newRRSP = parseFloat(e.target.value);
                                if (!isNaN(newRRSP)) {
                                  setEditingRRSP({
                                    ...editingRRSP,
                                    rrsp: newRRSP,
                                  });
                                }
                              }}
                              onBlur={() => {
                                if (editingRRSP) {
                                  onRRSPEdit?.(
                                    editingRRSP.irc,
                                    editingRRSP.rrsp
                                  );
                                }
                                setEditingRRSP(null);
                              }}
                              autoFocus
                              className="w-20 border border-gray-300 rounded px-1 py-0.5 text-sm"
                              step="0.01"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingRRSP({
                                  irc: product.irc,
                                  rrsp: distributorPrice.rrsp,
                                });
                              }}
                              className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded min-h-[22px]"
                            >
                              ${distributorPrice.rrsp.toFixed(2)}
                            </div>
                          )
                        ) : (
                          "-"
                        )}
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </InfiniteScroll>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal.Root
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        withinPortal={false}
        trapFocus={false}
        className={
          deleteModalOpened ? "absolute top-0 right-60 h-full w-full" : "hidden"
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
                Delete Product
              </h2>
              <p className="mb-4">
                Are you sure you want to delete this product? This action cannot
                be undone.
              </p>
              <div className="space-y-6">
                <Group justify="flex-end" mt="xl" gap={10}>
                  <Button
                    variant="outline"
                    className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    onClick={closeDeleteModal}
                    disabled={isDeletingProduct}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-500 bg-red-500 border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-red-600 transition-all ease-in-out duration-300"
                    onClick={confirmDeleteProduct}
                    disabled={isDeletingProduct}
                  >
                    {isDeletingProduct ? "Deleting..." : "Delete"}
                  </Button>
                </Group>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>

      {benchmarkProduct && (
        <PriceBenchmarkModal
          opened={isBenchmarkModalOpen}
          onClose={() => {
            setIsBenchmarkModalOpen(false);
            setBenchmarkProduct(null);
          }}
          onSave={(benchmark) => {
            setBenchmarkedProducts((prev) => {
              const newSet = new Set(prev);
              if (benchmarkProduct) newSet.add(benchmarkProduct.id);
              return newSet;
            });
            setIsBenchmarkModalOpen(false);
            setBenchmarkProduct(null);
            // Optionally: handle saving the benchmark data to server here
          }}
          initialValue={null} // or pass existing benchmark if available
          productId={benchmarkProduct.id}
          innovationId={innovationId}
          offeringId={offeringId}
          isEditMode={true}
          productData={{
            ...benchmarkProduct,
            product_type: benchmarkProduct.product_type as
              | "saleable"
              | "non-saleable",
            pref: benchmarkProduct.pref as "pref" | "non-pref",
            grouping: benchmarkProduct.grouping as unknown as "1" | "2" | "3",
            price: benchmarkProduct.price ? Number(benchmarkProduct.price) : 0,
            launch_date:
              benchmarkProduct.launch_date instanceof Date
                ? benchmarkProduct.launch_date.toISOString().split("T")[0]
                : benchmarkProduct.launch_date,
            discontinue_date:
              benchmarkProduct.discontinue_date instanceof Date
                ? benchmarkProduct.discontinue_date.toISOString().split("T")[0]
                : benchmarkProduct.discontinue_date,
          }}
        />
      )}
    </div>
  );
}

export default CombinedInnovationTables;
