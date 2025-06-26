import {
  MasterDistributor,
  MasterProduct,
  MasterProductFilters
} from "@/types";
import { Loader } from "@mantine/core";
import { useState } from "react";
import DistributorPrices from "./DistributorPrices";
import ProductTable from "./ProductTable";

const MasterDataViewModal = ({
  filters,
  tableHeader,
  tableFields,
  hasNextPage,
  fetchNextPage,
  products,
  distributors,
  isLoading,
  error,
  isFetchingNextPage,
}: {
  filters: MasterProductFilters;
  tableHeader?: string[];
  tableFields?: string[];
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  products?: MasterProduct[];
  distributors?: MasterDistributor[];
  isLoading?: boolean;
  error?: Error | null;
  isFetchingNextPage?: boolean;
}) => {
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  // --- Add scroll sync state ---
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollSource, setScrollSource] = useState<
    "product" | "distributor" | null
  >(null);

  // Helper to update scrollTop and source
  function handleScrollSync(
    newScrollTop: number,
    source: "product" | "distributor"
  ) {
    setScrollTop(newScrollTop);
    setScrollSource(source);
  }


  if (isFetchingNextPage && products?.length === 0) {
    return (
      <div className="bg-gray-50 mt-5 text-center py-4">
        <Loader size="md" />
      </div>
    );
  }

  if (
    !isFetchingNextPage &&
    products?.length === 0 &&
    !hasNextPage
  ) {
    return (
      <div className="bg-gray-50 mt-5 text-center py-4">
        <p className="text-gray-500">
          No master products found with the current filters.
        </p>
      </div>
    );
  }

  if (products && products?.length > 0) {
    return (
      <div className=" bg-gray-50 mt-5">
        <div className="mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-0.5">
            {/* Product Table Section - 1/2 width */}
            <div className="lg:col-span-3 bg-white rounded-s-xl shadow overflow-hidden">
              <ProductTable
                products={products ?? []}
                selectedRow={selectedRow}
                setSelectedRow={setSelectedRow}
                fetchMoreData={() => { fetchNextPage?.(); }}
                hasMore={hasNextPage ?? false}
                isLoadingMore={isFetchingNextPage ?? false}
                scrollTop={scrollTop}
                setScrollTop={(val) => handleScrollSync(val, "product")}
                scrollSource={scrollSource}
              />
            </div>

            {/* Distributor Prices Section - 1/2 width */}
            <div className="lg:col-span-3 bg-white rounded-e-xl shadow overflow-hidden">
              <DistributorPrices
                distributors={distributors ?? []}
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
                scrollTop={scrollTop}
                setScrollTop={(val) => handleScrollSync(val, "distributor")}
                scrollSource={scrollSource}
                isLoadingMore={isFetchingNextPage}
                hasMore={hasNextPage}
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
