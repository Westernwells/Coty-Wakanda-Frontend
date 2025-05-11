import { getMasterData } from "@/api/products/master-data";
import {
  MasterDistributor,
  MasterProduct,
  MasterProductFilters,
  Meta,
} from "@/types";
import { Loader } from "@mantine/core";
import { useEffect, useState, useCallback } from "react";
import DistributorPrices from "./DistributorPrices";
import ProductTable from "./ProductTable";

const MasterDataViewModal = ({
  filters,
  initialData,
  initialMeta,
  tableHeader,
  tableFields,
}: {
  initialData: {
    products: MasterProduct[];
    distributors: MasterDistributor[];
  };
  initialMeta: Meta;
  filters: MasterProductFilters;
  tableHeader?: string[];
  tableFields?: string[];
}) => {
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [masterProducts, setMasterProducts] = useState<{
    products: MasterProduct[];
    distributors: MasterDistributor[];
  }>(initialData);

  const [productsMeta, setProductsMeta] = useState<Meta>(initialMeta);
  const [productsHasMore, setProductsHasMore] = useState(initialMeta.has_next);
  const [productsIsLoadingMore, setProductsIsLoadingMore] = useState(false);

  useEffect(() => {
    setMasterProducts(initialData);
    setProductsMeta(initialMeta);
    setProductsHasMore(initialMeta.has_next);
    setSelectedRow(null);
    // Reset loading state as well
    setProductsIsLoadingMore(false);
    if (initialData.products.length === 0 && initialMeta.has_next) {
      // This effect will be handled by the one below after state is set
    }
  }, [filters, initialData, initialMeta]);

  const fetchMoreProductsData = useCallback(async () => {
    if (!productsMeta?.has_next || productsIsLoadingMore) return;

    setProductsIsLoadingMore(true);
    try {
      const response = await getMasterData({
        cursor: productsMeta.cursor,
        page_size: 20, // Consider making page_size configurable or consistent
        filter: filters,
      });

      setMasterProducts((prev) => ({
        products: [...prev.products, ...response.data.products],
        // This distributor update strategy might need refinement later
        // to handle potential duplicates or ensure data consistency.
        // For now, retaining original logic for minimal targeted change.
        distributors: [...prev.distributors, ...response.data.distributors],
      }));
      setProductsMeta(response.meta);
      setProductsHasMore(response.meta.has_next);
    } catch (error) {
      console.error("Error fetching more product data:", error);
      // setProductsHasMore(false); // Consider implications
    } finally {
      setProductsIsLoadingMore(false);
    }
  }, [productsMeta, productsIsLoadingMore, filters]);

  useEffect(() => {
    // This effect ensures that if the component loads with no products but expects more,
    // it fetches them automatically.
    if (
      masterProducts.products.length === 0 &&
      productsHasMore &&
      !productsIsLoadingMore
    ) {
      fetchMoreProductsData();
    }
  }, [
    masterProducts.products.length,
    productsHasMore,
    productsIsLoadingMore,
    fetchMoreProductsData,
  ]);

  if (productsIsLoadingMore && masterProducts.products.length === 0) {
    return (
      <div className="bg-gray-50 mt-5 text-center py-4">
        <Loader size="md" />
      </div>
    );
  }

  if (
    !productsIsLoadingMore &&
    masterProducts.products.length === 0 &&
    !productsHasMore
  ) {
    return (
      <div className="bg-gray-50 mt-5 text-center py-4">
        <p className="text-gray-500">
          No master products found with the current filters.
        </p>
      </div>
    );
  }

  if (masterProducts.products.length > 0) {
    return (
      <div className=" bg-gray-50 mt-5">
        {/* Filters Section */}
        {/* <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                House
                            </label>
                            <select className="w-full border border-gray-300 rounded-md shadow-sm p-2">
                                <option value="">All Houses</option>
                                <option value="Chloe">Chloe</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Brand
                            </label>
                            <select className="w-full border border-gray-300 rounded-md shadow-sm p-2">
                                <option value="">All Brands</option>
                                <option value="Chloe Nomade EDP">
                                    Chloe Nomade EDP
                                </option>
                                <option value="Chloe Nomade EDT">
                                    Chloe Nomade EDT
                                </option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Distributor
                            </label>
                            <select className="w-full border border-gray-300 rounded-md shadow-sm p-2">
                                <option value="">All Distributors</option>
                                {initialData?.distributors.map((dist) => (
                                    <option key={dist.id} value={dist.name}>
                                        {dist.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 pl-10"
                                />
                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div> */}
        <div className="mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Product Table Section - 3/5 width */}
            <div className="lg:col-span-3 bg-white rounded-lg shadow overflow-hidden">
              <ProductTable
                products={masterProducts.products}
                selectedRow={selectedRow}
                setSelectedRow={setSelectedRow}
                fetchMoreData={fetchMoreProductsData}
                hasMore={productsHasMore}
                isLoadingMore={productsIsLoadingMore}
              />
            </div>

            {/* Distributor Prices Section - 2/5 width */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
              <DistributorPrices
                distributors={masterProducts.distributors}
                selectedRow={selectedRow}
                setSelectedRow={setSelectedRow}
                tableHeader={
                  tableHeader || [
                    "Billing Price",
                    "RRSP",
                    "C1",
                    "French USD",
                    "French EUR",
                  ]
                }
                tableFields={
                  tableFields || [
                    "billing_price",
                    "rrsp",
                    "c1",
                    "french_usd",
                    "french_eur",
                  ]
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 mt-5 text-center py-4">
      <Loader size="md" />
    </div>
  );
};

export default MasterDataViewModal;
