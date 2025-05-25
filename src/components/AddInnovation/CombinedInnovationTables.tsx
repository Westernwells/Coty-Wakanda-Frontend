import { Product } from "@/types";
import React, { useState } from "react";
import { Loader, Table, Checkbox } from "@mantine/core";
import InfiniteScroll from "react-infinite-scroll-component";
import { CustomSelect } from "../HomePage/CustomSelect";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Distributor prices props
  distributors,
  tableHeader,
  tableFields,
  onPriceEdit,
  onRRSPEdit,
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

  const currentDistributor = distributors[currentDistributorIndex] || null;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (!onSelectedProductsChange) return;

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
    if (!onSelectedProductsChange) return;

    const newSelectedProducts = selectedProducts.includes(productId)
      ? selectedProducts.filter((id) => id !== productId)
      : [...selectedProducts, productId];

    onSelectedProductsChange(newSelectedProducts);
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

  if (!products.length) {
    return <p>No products available</p>;
  }

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
                  <Table.Th className="rounded-ss-xl checkbox-cell w-[40px]">
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
                  </Table.Th>
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
                      <Table.Td className="checkbox-cell w-[40px]">
                        <div onClick={(e) => e.stopPropagation()}>
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
                        </div>
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
    </div>
  );
}

export default CombinedInnovationTables;
