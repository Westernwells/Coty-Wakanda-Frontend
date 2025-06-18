import { cn } from "@/lib/utils";
import type { Product } from "@/api/pricingList/get-pricing-product-list";
import React, { useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader } from "@mantine/core";

interface AddPricingListProductTableProps {
  products: Product[];
  selectedRow: string | null;
  setSelectedRow: React.Dispatch<React.SetStateAction<string | null>>;
  fetchMoreData: () => Promise<void>;
  hasMore: boolean;
  isLoadingMore: boolean;
  onPriceChange: (irc: string, newPrice: number) => void;
  selectedProductsWithPrices: Array<{
    product_id: string;
    price: string | number;
  }>;
  isEditing?: boolean;
}

const TableLoader = () => (
  <div className="text-center self-center w-full ">
    <Loader size="md" className="text-center" />
  </div>
);

const AddPricingListProductTable: React.FC<AddPricingListProductTableProps> = ({
  products,
  selectedRow,
  setSelectedRow,
  fetchMoreData,
  hasMore,
  isLoadingMore,
  onPriceChange,
  selectedProductsWithPrices,
  isEditing = false,  
}) => {
  const scrollableRef = useRef<HTMLDivElement>(null);

  const handlePriceInputChange = (
    irc: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newPrice = event.target.value;
    if (newPrice === "" || isNaN(Number(newPrice))) {
      if (newPrice === "") {
        onPriceChange(irc, 0);
      }
    } else {
      onPriceChange(irc, Number(newPrice));
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b sticky top-0 bg-white z-20">
        <h2 className="text-xl font-semibold text-gray-800">Product List</h2>
      </div>
      <div
        id="addPricingListProductTableScrollable"
        ref={scrollableRef}
        className="flex-grow overflow-y-auto max-h-[800px]"
      >
        <InfiniteScroll
          dataLength={products.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={
            isLoadingMore ? (
              <TableLoader />
            ) : (
              <tr style={{ height: "50px" }}>
                <td colSpan={7} />
              </tr>
            )
          }
          scrollableTarget="addPricingListProductTableScrollable"
          endMessage={
            <tr className="w-full">
              <td colSpan={7} className="text-center text-gray-500 py-4">
                {products.length > 0 ? "No more products to load." : ""}
              </td>
            </tr>
          }
          className="min-w-full"
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand Name
                </th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand Line (Pillar)
                </th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article Type
                </th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IRC
                </th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article Type
                </th>
                <th className="px-2 py-1 text-left text-xs  whitespace-nowrap font-medium text-gray-500 uppercase tracking-wider">
                  Base Price
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const selectedProduct = selectedProductsWithPrices.find(
                  (sp) => sp.product_id === product.irc
                );
                const priceValue = selectedProduct
                  ? selectedProduct.price
                  : product.price;
                return (
                  <tr
                    key={product.irc}
                    onClick={() => setSelectedRow(product.irc)}
                    className={cn(
                      "cursor-pointer hover:bg-primary/10",
                      selectedRow === product.irc && "bg-primary/30"
                    )}
                  >
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                      {product.brand?.name || "-"}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                      {product.material_description || "-"}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                      {product.brand_pillar?.name || "-"}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                      {product.article_type || "-"}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                      {product.irc || "-"}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                      {product.article_type}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="number"
                        value={
                          priceValue === null || priceValue === undefined
                            ? ""
                            : String(priceValue)
                        }
                        onChange={(e) => handlePriceInputChange(isEditing ? String(product.id) : String(product.irc), e)}
                        onFocus={() => setSelectedRow(isEditing ? String(product.id) : String(product.irc))}
                        className={cn(
                          "w-24 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-1",
                          selectedRow === product.irc
                            ? "bg-white"
                            : "bg-gray-100"
                        )}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default AddPricingListProductTable;
