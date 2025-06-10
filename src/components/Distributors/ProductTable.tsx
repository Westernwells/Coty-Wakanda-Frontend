import { cn } from "@/lib/utils";
import { MasterProduct } from "@/types";
import React, { useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader } from "@mantine/core";

interface ProductTableProps {
  products: MasterProduct[];
  selectedRow: string | null;
  setSelectedRow: React.Dispatch<React.SetStateAction<string | null>>;
  fetchMoreData: () => Promise<void>;
  hasMore: boolean;
  isLoadingMore: boolean;
  scrollTop: number;
  setScrollTop: (scrollTop: number) => void;
  scrollSource: "product" | "distributor" | null;
}

export const TableLoader = () => (
  <div className="text-center self-center w-full ">
    <Loader size="md" className="text-center" />
  </div>
);

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  selectedRow,
  setSelectedRow,
  fetchMoreData,
  hasMore,
  isLoadingMore,
  scrollTop,
  setScrollTop,
  scrollSource,
}) => {
  const scrollableRef = useRef<HTMLDivElement>(null);
  const scrolling = React.useRef(false);

  // Sync scroll position from parent
  React.useEffect(() => {
    if (scrollSource !== "product" && scrollableRef.current) {
      if (Math.abs(scrollableRef.current.scrollTop - scrollTop) > 1) {
        scrolling.current = true;
        scrollableRef.current.scrollTop = scrollTop;
      }
    }
  }, [scrollTop, scrollSource]);

  // After setting scroll, reset scrollSource to null
  React.useEffect(() => {
    if (scrolling.current && scrollSource !== "product") {
      scrolling.current = false;
      setScrollTop(scrollTop); // This will set source to 'product' in parent
    }
  }, [scrollTop, scrollSource, setScrollTop]);

  // On scroll, update parent if source is not product
  function handleScroll() {
    if (scrollableRef.current) {
      if (!scrolling.current) {
        setScrollTop(scrollableRef.current.scrollTop);
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b sticky top-0 bg-white z-20">
        <h2 className="text-xl font-semibold text-gray-800">Product List</h2>
      </div>
      <div
        id="productTableScrollable"
        ref={scrollableRef}
        className="flex-grow overflow-y-auto max-h-[calc(100vh-28rem)]"
        onScroll={handleScroll}
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
                <td colSpan={6}></td>
              </tr>
            )
          }
          scrollableTarget="productTableScrollable"
          endMessage={
            <tr className="w-full">
              <td colSpan={6} className="text-center text-gray-500 py-4">
                {products.length > 0 ? "No more products to load." : ""}
              </td>
            </tr>
          }
          className="min-w-full"
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-primary text-white sticky top-0 z-10">
              <tr>
                <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">
                  House
                </th>
                <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">
                  Description
                </th>
                <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">
                  Brand Line
                </th>
                <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">
                  Article Type
                </th>
                <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">
                  IRC
                </th>
                <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">
                  Group
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr
                  key={product.irc}
                  onClick={() => setSelectedRow(product.irc)}
                  className={cn(
                    "cursor-pointer hover:bg-primary/10",
                    selectedRow === product.irc
                      ? "bg-primary/30"
                      : " odd:bg-white even:bg-[#F2F4F6]"
                  )}
                >
                  <td className="px-2 py-[3px] whitespace-nowrap text-sm text-gray-900">
                    {product.house}
                  </td>
                  <td className="px-2 py-[3px] whitespace-nowrap text-sm text-gray-900">
                    {product.description}
                  </td>
                  <td className="px-2 py-[3px] whitespace-nowrap text-sm text-gray-900">
                    {product.brand_line}
                  </td>
                  <td className="px-2 py-[3px] whitespace-nowrap text-sm text-gray-900">
                    {product.article_type}
                  </td>
                  <td className="px-2 py-[3px] whitespace-nowrap text-sm text-gray-900">
                    {product.irc}
                  </td>
                  <td className="px-2 py-[3px] whitespace-nowrap text-sm text-gray-900">
                    {product.group}
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

export default ProductTable;
