import { cn } from "@/lib/utils";
import { Product } from "@/api/billingList/get-billing-product-list";
import React, { useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader } from "@mantine/core";

interface AddBillingListProductTableProps {
  products: Product[];
  selectedRow: string | null;
  setSelectedRow: React.Dispatch<React.SetStateAction<string | null>>;
  fetchMoreData: () => Promise<void>;
  hasMore: boolean;
  isLoadingMore: boolean;
  onPriceChange: (irc: string, newPrice: number) => void;
}

const TableLoader = () => (
  <div className="text-center self-center w-full ">
    <Loader size="md" className="text-center" />
  </div>
);

const AddBillingListProductTable: React.FC<AddBillingListProductTableProps> = ({
  products,
  selectedRow,
  setSelectedRow,
  fetchMoreData,
  hasMore,
  isLoadingMore,
  onPriceChange,
}) => {
  const scrollableRef = useRef<HTMLDivElement>(null);

  const handlePriceInputChange = (
    irc: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newPrice = event.target.value;
    // Allow empty string for temporary input state, or convert to number
    if (newPrice === "" || isNaN(Number(newPrice))) {
      // Potentially handle invalid input, or rely on parent to validate/convert
      // For now, if it's not a valid number, we might not call onPriceChange
      // or call it with a specific signal for invalid input.
      // Let's assume for now we only call onPriceChange with valid numbers.
      if (newPrice === "") {
        onPriceChange(irc, 0); // Or some other placeholder like NaN, null
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
        id="addBillingListProductTableScrollable"
        ref={scrollableRef}
        className="flex-grow overflow-y-auto max-h-[calc(100vh-28rem)]"
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
          scrollableTarget="addBillingListProductTableScrollable"
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
              {products.map((product) => (
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
                        product.price === null || product.price === undefined
                          ? ""
                          : String(product.price)
                      }
                      onChange={(e) => handlePriceInputChange(product.irc, e)}
                      onFocus={() => setSelectedRow(product.irc)}
                      className={cn(
                        "w-24 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-1",
                        selectedRow === product.irc
                          ? "bg-white"
                          : "bg-transparent border-none pointer-events-none"
                      )}
                      // Disable if not the selected row to prevent accidental edits,
                      // or simply style to appear non-interactive.
                      // The pointer-events-none on bg-transparent helps achieve this.
                      // For a more robust read-only look, you might need more conditional styling or a disabled attribute.
                      readOnly={selectedRow !== product.irc}
                      onClick={(e) => e.stopPropagation()} // Prevent row click event when clicking input
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default AddBillingListProductTable;
