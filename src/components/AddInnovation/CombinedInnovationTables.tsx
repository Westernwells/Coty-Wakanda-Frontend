"use client";

import { useDeleteOfferingProduct } from "@/api/innovations/offerings/products/delete-product";
import { useUpdateOfferingProduct } from "@/api/innovations/offerings/products/update-product";
import { OfferingProductData } from "@/api/products/get-offering-products";
import { cn } from "@/lib/utils";
import { queryClient } from "@/main";
import { PriceBenchmark, Product } from "@/types";
import { Product as InnovationProduct } from "@/types/InnovationOfferProduct";
import { Button, Checkbox, Group, Loader, Modal, Table } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { PriceBenchmarkModal } from "../AddInnovation/price-benchmark/PriceBenchmarkModal";
import { ConfirmationModal } from "../Shared/ConfirmationModal";
import useOfferingProducts from "./Offering/hooks/useOfferingProducts";
import useProductData, { mapOfferingProducts } from "./Offering/hooks/useProductData";
import { useDeleteBenchmark } from "@/api/products/delete-benchmark";
import { on } from "events";

interface CombinedInnovationTablesProps {
  // Products table props
  products: Product[];
  isEdit: boolean;
  onProductSelect?: (product: Product) => void;
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
      c1: number
    }[];
  }[];
  // New props
  innovationId: string;
  offeringId: string;

  // Local edit and delete props
  onLocalEdit?: (product: Product) => void;
  onLocalDelete?: (product: Product) => void;
  productListData?: InnovationProduct[]; // Optional prop for product list data
}

function CombinedInnovationTables({
  // Products table props
  products,
  isEdit,
  onProductSelect,
  selectedProducts = [],
  onSelectedProductsChange,
  isDeleteMode,

  // Distributor prices props
  distributors,
  // New props
  innovationId,
  offeringId,

  // Local edit and delete props
  onLocalEdit,
  onLocalDelete,
  productListData,
}: CombinedInnovationTablesProps) {
  const { fetchOfferingProducts } = useOfferingProducts(innovationId);
  const [currentDistributorIndex, setCurrentDistributorIndex] = useState(0);
  const [localProducts, setLocalProducts] = useState<Product[]>(products);

  const [removeBenchmark, setRemoveBenchmark] = useState(false);
  const [benchmarkProduct, setBenchmarkProduct] = useState<
  | (Product & {
      icp_cost?: number;
    })
  | null
>(null);
  const {mutate:removeBenchmarkProduct, isPending} = useDeleteBenchmark({
    onSuccess:async () => {
      queryClient.invalidateQueries({
        queryKey: ["offering-products", Number(offeringId)],
      });
      setRemoveBenchmark(false);
      setBenchmarkProduct(null);
      const data = await fetchOfferingProducts(Number(offeringId));
      setLocalProducts(data?.products ? mapOfferingProducts(data.products as unknown as OfferingProductData[]) as unknown as Product[] : []);
    }
  });

  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const updateProduct = useUpdateOfferingProduct();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  // useEffect(() => {
  //   setLocalProducts(products);
  // }, [products]);

  const [benchmarkedProducts, setBenchmarkedProducts] = useState<Set<number>>(
    new Set()
  );
  const [isBenchmarkModalOpen, setIsBenchmarkModalOpen] = useState(false);


  const productData = useMemo(() => {
    return {
      ...benchmarkProduct,
      product_type: benchmarkProduct?.product_type as
        | "saleable"
        | "non-saleable",
      pref: benchmarkProduct?.pref as "pref" | "non-pref",
      grouping: benchmarkProduct?.grouping as unknown as "1" | "2" | "3",
      currency: (benchmarkProduct?.currency === "EUR" ? "EUR" : "USD") as
        | "EUR"
        | "USD",
      price: benchmarkProduct?.price ? Number(benchmarkProduct?.price) : 0,
      launch_date:
        benchmarkProduct?.launch_date instanceof Date
          ? benchmarkProduct?.launch_date.toISOString().split("T")[0]
          : benchmarkProduct?.launch_date,
      discontinue_date:
        benchmarkProduct?.discontinue_date instanceof Date
          ? benchmarkProduct?.discontinue_date.toISOString().split("T")[0]
          : benchmarkProduct?.discontinue_date,
    };
  }, [benchmarkProduct]);
  const currentDistributor = distributors[currentDistributorIndex] || null;
  console.log("CombinedInnovationTables productData:", currentDistributor);

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
        fetchOfferingProducts(Number(offeringId));
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
      ? localProducts.map((product) => product.id)
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
    if (product?.price_benchmark) {
      setBenchmarkProduct(product);
      setRemoveBenchmark(true);
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
    setSelectedRow(product.irc);
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

  const [scrollTop, setScrollTop] = useState(0);
  const [scrollSource, setScrollSource] = useState<
    "product" | "distributor" | null
  >(null);

  function handleScrollSync(
    newScrollTop: number,
    source: "product" | "distributor"
  ) {
    setScrollTop(newScrollTop);
    setScrollSource(source);
  }

  const productScrollRef = useRef<HTMLDivElement | null>(null);
  const distributorScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const productEl = productScrollRef.current;
    const distributorEl = distributorScrollRef.current;

    function onProductScroll(e: Event) {
      if (scrollSource === "distributor") return;
      const target = e.target as HTMLElement;
      handleScrollSync(target.scrollTop, "product");
    }

    function onDistributorScroll(e: Event) {
      if (scrollSource === "product") return;
      const target = e.target as HTMLElement;
      handleScrollSync(target.scrollTop, "distributor");
    }

    productEl?.addEventListener("scroll", onProductScroll);
    distributorEl?.addEventListener("scroll", onDistributorScroll);

    return () => {
      productEl?.removeEventListener("scroll", onProductScroll);
      distributorEl?.removeEventListener("scroll", onDistributorScroll);
    };
  }, [scrollSource]);

  useEffect(() => {
    if (scrollSource === "product" && distributorScrollRef.current) {
      distributorScrollRef.current.scrollTop = scrollTop;
    } else if (scrollSource === "distributor" && productScrollRef.current) {
      productScrollRef.current.scrollTop = scrollTop;
    }
  }, [scrollTop, scrollSource]);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);

    if (isEdit) {
      // testing
    } else {
      const editData = {
        ...product,
        icp_eur: product.icp_eur,
        icp_usd: product.icp_usd,
        grouping: product.grouping,
        currency: product.currency,
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
      const deleteResult = await deleteProductMutation.mutateAsync({
        innovationId,
        offeringId,
        productId: productToDelete.id,
      },{
        onSuccess() {
          closeDeleteModal();
        },
      });

      const updatedProducts = localProducts.filter(
        (p) => p.id !== productToDelete.id
      );
      setLocalProducts(updatedProducts);

      if (onLocalDelete) {
        onLocalDelete(productToDelete);
      }

      try {
        await fetchOfferingProducts(Number(offeringId));
      } catch (fetchError) {
        console.error("Error fetching products after deletion:", fetchError);
      }

      closeDeleteModal();
      setProductToDelete(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setIsDeletingProduct(false);
    }
  };

  if (!localProducts || localProducts.length === 0) {
    return <p>No products available</p>;
  }
  function handleSave(productId: number, localValue?: PriceBenchmark | null) {
    updateProduct.mutate(
      {
        innovationId,
        offeringId,
        id: productId,
        data: {
          ...productData,
          irc: productData.irc ?? "",
          icp_cost: productData?.icp_cost ?? 0,
          price: productData.price ?? 0,
          currency: productData.currency ?? "USD",
          brand_id: String(productData?.brand?.id) || "",
          product_type: productData.product_type ?? "saleable",
          pref: productData.pref ?? "pref",
          grouping: productData.grouping ?? "1",
          ...(localValue
            ? { price_benchmark: localValue }
            : { price_benchmark: null }),
        },
      },
      {
        onSuccess: async () => {
          setBenchmarkProduct(null);
          queryClient.invalidateQueries({
            queryKey: ["offering-products", innovationId, offeringId],
          });
          const data = await fetchOfferingProducts(Number(offeringId));

          setLocalProducts(data?.products ? mapOfferingProducts(data.products as unknown as OfferingProductData[]) as unknown as Product[] : []);
         
        },
      }
    );

}

  return (
    <div className="">
      <div className="relative grid grid-cols-6 max-h-fit h-full">
        {/* Products Table */}
        <div className="col-span-4 mb-4">
          <div className="flex">
            <h3 className="text-lg font-semibold text-primary">Product list</h3>
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
            className="relative border border-primary rounded-s-xl"
            scrollableTarget="products-scroll-container"
          >
            <Table.ScrollContainer minWidth={1200} ref={productScrollRef}>
              <Table
                verticalSpacing="sm"
                borderColor="transparent"
                striped="even"
                stripedColor="#F2F4F6"
                style={{ padding: "0px" }}
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
                    <Table.Th>Benchmarked</Table.Th>
                    <Table.Th>IRC</Table.Th>
                    <Table.Th>Benchmark IRC</Table.Th>
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
                    <Table.Th>CSSP_TREX_EUR</Table.Th>
                    <Table.Th>CSSP_TREX_USD</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {localProducts.map((product, index) => {
                    const distributorPrice = currentDistributor?.data.find(
                      (price) => price.irc === product.irc
                    );

                    return (
                      <Table.Tr
                        key={product.id}
                        onClick={(e) => handleRowClick(e, product)}
                        className={cn(
                          "cursor-pointer hover:bg-primary/10",
                          selectedRow === product.irc
                            ? "bg-primary/30"
                            : " odd:bg-white even:bg-[#F2F4F6] max-h-[42px]"
                        )}
                        style={{ padding: "0px", height: "42px" }}
                      >
                        <Table.Td
                          className="checkbox-cell w-[120px] max-h-[42px]"
                          style={{
                            height: "42px !important",
                            paddingTop: "0px",
                            paddingBottom: "0px",
                          }}
                        >
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
                                    maxHeight: "42px",
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
                        <Table.Td
                          className="max-h-[42px]"
                          style={{
                            height: "42px !important",
                            paddingTop: "0px",
                            paddingBottom: "0px",
                          }}
                        >
                          <Checkbox
                            checked={product?.price_benchmark ? true : false}
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
                                padding: "0px",
                              },
                            }}
                          />
                        </Table.Td>
                        <Table.Td
                          className="max-h-[42px]"
                          style={{
                            height: "42px !important",
                            paddingTop: "0px",
                            paddingBottom: "0px",
                          }}
                        >
                          {product.irc}
                        </Table.Td>
                        {/* comming soon from  product?.price_benchmark?.irc */}
                        <Table.Td
                          className="max-h-[42px]"
                          style={{
                            height: "42px !important",
                            paddingTop: "0px",
                            paddingBottom: "0px",
                          }}
                        >
                         {product?.price_benchmark?.product_irc || "-"}
                        </Table.Td>
                        <Table.Td
                          className="max-h-[42px]"
                          style={{
                            height: "42px !important",
                            paddingTop: "0px",
                            paddingBottom: "0px",
                          }}
                        >
                          {product.brand?.name}
                        </Table.Td>
                        <Table.Td
                          className="max-h-[42px]"
                          style={{
                            height: "42px !important",
                            paddingTop: "0px",
                            paddingBottom: "0px",
                          }}
                        >
                          {product.brand?.type}
                        </Table.Td>
                        <Table.Td
                          className="max-h-[42px]"
                          style={{
                            height: "42px !important",
                            paddingTop: "0px",
                            paddingBottom: "0px",
                          }}
                        >
                          {product.brand_pillar?.name || "-"}
                        </Table.Td>
                        <Table.Td
                          className="max-h-[42px]"
                          style={{
                            height: "42px !important",
                            paddingTop: "0px",
                            paddingBottom: "0px",
                          }}
                        >
                          {product.material_description}
                        </Table.Td>
                        <Table.Td
                          className="max-h-[42px]"
                          style={{
                            height: "42px !important",
                            paddingTop: "0px",
                            paddingBottom: "0px",
                          }}
                        >
                          {product.icp_eur}
                        </Table.Td>
                        <Table.Td
                          className="max-h-[42px]"
                          style={{
                            height: "42px !important",
                            paddingTop: "0px",
                            paddingBottom: "0px",
                          }}
                        >
                          {product.icp_usd}
                        </Table.Td>
                        <Table.Td
                          className="max-h-[42px]"
                          style={{
                            height: "42px !important",
                            paddingTop: "0px",
                            paddingBottom: "0px",
                          }}
                        >
                          <span className="text-white bg-blue px-[10px] rounded-full text-nowrap">
                            {product.pref}
                          </span>
                        </Table.Td>
                        <Table.Td
                          className="border-r border-gray-200 max-h-[42px]"
                          style={{
                            height: "42px !important",
                            paddingTop: "0px",
                            paddingBottom: "0px",
                          }}
                        >
                          {product.status && (
                            <span className="text-white bg-blue px-[10px] rounded-full text-nowrap">
                              {product.status}
                            </span>
                          )}
                        </Table.Td>
                        <Table.Td
                          style={{
                            height: "42px !important",
                            paddingTop: "0px",
                            paddingBottom: "0px",
                          }}
                        >
                         ---
                        </Table.Td>
                        <Table.Td
                          style={{
                            height: "42px !important",
                            paddingTop: "0px",
                            paddingBottom: "0px",
                          }}
                        >
                         ---
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </InfiniteScroll>
        </div>

        {/* DistributorPrices Table */}
        <div className="col-span-2 mb-4">
          <div className="flex items-center justify-between gap-4">
            {currentDistributor && (
              <>
                <h3 className="text-lg font-semibold text-primary truncate">
                  Distributor Prices
                </h3>
                <div className="flex items-center space-x-1">
                  <span
                    className="text-sm font-medium text-gray-600 truncate max-w-xs"
                    title={currentDistributor.name}
                  >
                    {currentDistributor.name}
                  </span>
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

          <InfiniteScroll
            dataLength={products.length}
            next={() => {}}
            hasMore={false}
            loader={
              <div className="text-center py-4">
                <Loader size="md" />
              </div>
            }
            className="relative border border-primary rounded-e-xl"
            scrollableTarget="products-scroll-container"
          >
            <Table.ScrollContainer minWidth={600} ref={distributorScrollRef}>
              <Table
                verticalSpacing="sm"
                borderColor="transparent"
                striped="even"
                stripedColor="#F2F4F6"
              >
                <Table.Thead>
                  <Table.Tr className="bg-primary text-white">
                    {/* Distributor Price Columns */}
                    <Table.Th className="border-l border-gray-200">
                      Billing Price
                    </Table.Th>
                    <Table.Th>RRSP</Table.Th>
                    <Table.Th>C1</Table.Th>
                    <Table.Th>French USD</Table.Th>
                    <Table.Th>French EUR</Table.Th>
   
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {localProducts.map((product, index) => {
                    const distributorPrice = currentDistributor?.data.find(
                      (price) => price.irc === product.irc
                    );

                    console.log("distributor Price", distributorPrice);

                    return (
                      <Table.Tr
                        key={product.id}
                        onClick={(e) => handleRowClick(e, product)}
                        className={cn(
                          "cursor-pointer hover:bg-primary/10",
                          selectedRow === product.irc
                            ? "bg-primary/30"
                            : " odd:bg-white even:bg-[#F2F4F6] max-h-[42px]"
                        )}
                        style={{ padding: "0px", height: "42px" }}
                      >
                        {/* Distributor Price Cells */}
                        <Table.Td
                          style={{
                            height: "42px !important",
                            paddingTop: "0px",
                            paddingBottom: "0px",
                          }}
                        >
                          {distributorPrice ? (
                            <> ${distributorPrice.billing_price.toFixed(2)}  </>
                          ) : (
                            "-"
                          )}
                        </Table.Td>
                        <Table.Td
                          style={{
                            height: "42px !important",
                            paddingTop: "0px",
                            paddingBottom: "0px",
                          }}
                        >
                          {distributorPrice ? (
                           <>
                              ${distributorPrice.rrsp.toFixed(2)}
                           </>
                          ) : (
                            "-"
                          )}
                        </Table.Td>
                        <Table.Td
                          style={{
                            height: "42px !important",
                            paddingTop: "0px",
                            paddingBottom: "0px",
                          }}
                        >
                          {distributorPrice ? (
                                <>
                                ${distributorPrice.c1?.toFixed(2)}
                                </>
                          ) : (
                            "-"
                          )}
                        </Table.Td>
                        <Table.Td
                          style={{
                            height: "42px !important",
                            paddingTop: "0px",
                            paddingBottom: "0px",
                          }}
                        >
                          {distributorPrice ? (
                           <>${distributorPrice.rrsp.toFixed(2)}</>
                          ) : (
                            "-"
                          )}
                        </Table.Td>
                        <Table.Td
                          style={{
                            height: "42px !important",
                            paddingTop: "0px",
                            paddingBottom: "0px",
                          }}
                        >
                          {distributorPrice ? (
                                <>{`$${distributorPrice.rrsp.toFixed(2)}`}</>
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
        <>
          <PriceBenchmarkModal
            opened={isBenchmarkModalOpen}
            onClose={() => {
              setIsBenchmarkModalOpen(false);
              setBenchmarkProduct(null);
            }}
            onSave={(benchmark) => {
              handleSave(benchmarkProduct.id, benchmark);
            }}
            initialValue={benchmarkProduct?.price_benchmark} // or pass existing benchmark if available
            isEditMode={true}
            productData={{
              ...benchmarkProduct,
              product_type: benchmarkProduct.product_type as
                | "saleable"
                | "non-saleable",
              pref: benchmarkProduct.pref as "pref" | "non-pref",
              grouping: benchmarkProduct.grouping as unknown as "1" | "2" | "3",
              currency: (benchmarkProduct.currency === "EUR"
                ? "EUR"
                : "USD") as "EUR" | "USD",
              price: benchmarkProduct.price
                ? Number(benchmarkProduct.price)
                : 0,
              launch_date:
                benchmarkProduct.launch_date instanceof Date
                  ? benchmarkProduct.launch_date.toISOString().split("T")[0]
                  : benchmarkProduct.launch_date,
              discontinue_date:
                benchmarkProduct.discontinue_date instanceof Date
                  ? benchmarkProduct.discontinue_date
                      .toISOString()
                      .split("T")[0]
                  : benchmarkProduct.discontinue_date,
            }}
            productListData={productListData}
          />
          <ConfirmationModal
            open={removeBenchmark}
            title="Remove Benchmark"
            subtext="Are you sure you want to remove the benchmark for this product?"
            confirmLabel="Remove"
            cancelLabel="Cancel"
            onCancel={() => setRemoveBenchmark(false)}
            onConfirm={() => {
              // handleSave(benchmarkProduct.id, null);
              removeBenchmarkProduct(benchmarkProduct.id);

            }}
            confirmButtonClassName="bg-red-500 text-white hover:bg-red-600 transition-all ease-in-out duration-300"
            cancelButtonClassName="border-red-500 text-red-500 hover:bg-red-100 transition-all ease-in-out duration-300"
          />
        </>
      )}
    </div>
  );
}

export default CombinedInnovationTables;
