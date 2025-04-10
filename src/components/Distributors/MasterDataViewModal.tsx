import { getMasterData } from "@/api/products/master-data";
import {
  MasterDistributor,
  MasterProduct,
  MasterProductFilters,
  Meta,
} from "@/types";
import { Loader } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import DistributorPrices from "./DistributorPrices";
import ProductTable from "./ProductTable";

const MasterDataViewModal = ({
  filters,
  initialData,
  initialMeta,
}: {
  initialData: {
    products: MasterProduct[];
    distributors: MasterDistributor[];
  };
  initialMeta: Meta;
  filters: MasterProductFilters;
}) => {
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const productTableRef = useRef<HTMLDivElement>(null);
  const distributorTableRef = useRef<HTMLDivElement>(null);
  const [masterProducts, setMasterProducts] = useState<{
    products: MasterProduct[];
    distributors: MasterDistributor[];
  }>(initialData);
  const [meta, setMeta] = useState<Meta>(initialMeta);
  const [hasMore, setHasMore] = useState(initialMeta.has_next);

  useEffect(() => {
    setMasterProducts(initialData);
    setMeta(initialMeta);
    setHasMore(initialMeta.has_next);
  }, [filters, initialData, initialMeta]);

  const fetchMoreDistributors = async () => {
    if (!meta?.has_next) return;

    try {
      const response = await getMasterData({
        cursor: meta.cursor,
        page_size: 20,
        filter: filters,
      });

      setMasterProducts((prev) => ({
        products: [...prev.products, ...response.data.products],
        distributors: [...prev.distributors, ...response.data.distributors],
      }));
      setMeta(response.meta);
      setHasMore(response.meta.has_next);
    } catch (error) {
      console.error("Error fetching more distributors:", error);
      setHasMore(false);
    }
  };

  if (!initialData.products.length) {
    return <p>Sorry no data with current filters, please try changing them</p>;
  }

  const handleScroll = (
    scrollingDiv: HTMLDivElement,
    otherDiv: HTMLDivElement | null
  ) => {
    if (otherDiv) {
      otherDiv.scrollTop = scrollingDiv.scrollTop;
    }
  };
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
      <InfiniteScroll
        dataLength={masterProducts.products.length}
        next={fetchMoreDistributors}
        hasMore={hasMore}
        loader={
          <div className="text-center py-4">
            <Loader size="md" />
          </div>
        }
        endMessage={
          <p className="text-center text-gray-500 py-4">
            No more master products to load.
          </p>
        }
      >
        {initialData.products.length && (
          <div className="mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Product Table Section - 3/2 width */}
              <div className="lg:col-span-3 bg-white rounded-lg shadow">
                <ProductTable
                  products={initialData.products}
                  selectedRow={selectedRow}
                  setSelectedRow={setSelectedRow}
                  tableRef={productTableRef}
                  onScroll={(e) =>
                    handleScroll(
                      e.target as HTMLDivElement,
                      distributorTableRef.current
                    )
                  }
                />
              </div>

              {/* Distributor Prices Section - 2/5 width */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow">
                <DistributorPrices
                  distributors={initialData.distributors}
                  selectedRow={selectedRow}
                  setSelectedRow={setSelectedRow}
                  tableRef={distributorTableRef}
                  onScroll={(e) =>
                    handleScroll(
                      e.target as HTMLDivElement,
                      productTableRef.current
                    )
                  }
                />
              </div>
            </div>
          </div>
        )}
      </InfiniteScroll>
    </div>
  );
};

export default MasterDataViewModal;
