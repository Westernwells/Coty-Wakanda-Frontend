import { cn } from "@/lib/utils";
import { MasterDistributor } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { TableLoader } from "./ProductTable";
import ExclamationTooltip from "../ExclamationToolTip";

interface DistributorPricesProps {
  distributors: MasterDistributor[];
  selectedRow: string | null;
  setSelectedRow: (irc: string | null) => void;
  tableHeader: string[];
  tableFields: string[];
  scrollTop: number;
  setScrollTop: (scrollTop: number) => void;
  scrollSource: "product" | "distributor" | null;
  isLoadingMore?: boolean;
  hasMore?: boolean;
}

const DistributorPrices: React.FC<DistributorPricesProps> = ({
  distributors,
  selectedRow,
  setSelectedRow,
  tableHeader,
  tableFields,
  scrollTop,
  setScrollTop,
  scrollSource,
  isLoadingMore = false,
  hasMore = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editingPrice, setEditingPrice] = useState<{
    irc: string;
    price: number;
  } | null>(null);
  const [editingRRSP, setEditingRRSP] = useState<{
    irc: string;
    rrsp: number;
  } | null>(null);

  const currentDistributorPrices = useMemo(() => {
    return distributors[currentIndex]?.data || [];
  }, [currentIndex, distributors]);

  const nextDistributor = () => {
    setCurrentIndex((prev) => (prev + 1) % (distributors.length || 1));
  };

  const prevDistributor = () => {
    setCurrentIndex(
      (prev) =>
        (prev - 1 + (distributors.length || 1)) % (distributors.length || 1)
    );
  };

  const currentDistributor = distributors[currentIndex] || null;

  const handlePriceEdit = (irc: string, price: number) => {
    setEditingPrice({ irc, price });
  };

  const handleRRSPEdit = (irc: string, rrsp: number) => {
    setEditingRRSP({ irc, rrsp });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingPrice) {
      const newPrice = parseFloat(e.target.value);
      if (!isNaN(newPrice)) {
        setEditingPrice({ ...editingPrice, price: newPrice });
      }
    }
  };

  const handleRRSPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingRRSP) {
      const newRRSP = parseFloat(e.target.value);
      if (!isNaN(newRRSP)) {
        setEditingRRSP({ ...editingRRSP, rrsp: newRRSP });
      }
    }
  };

  const handlePriceBlur = () => {
    setEditingPrice(null);
    // Here you would typically update the price in your data store
  };

  const handleRRSPBlur = () => {
    setEditingRRSP(null);
    // Here you would typically update the RRSP in your data store
  };

  const scrollableRef = React.useRef<HTMLDivElement>(null);
  const scrolling = React.useRef(false);

  // Sync scroll position from parent
  React.useEffect(() => {
    if (scrollSource !== "distributor" && scrollableRef.current) {
      if (Math.abs(scrollableRef.current.scrollTop - scrollTop) > 1) {
        scrolling.current = true;
        scrollableRef.current.scrollTop = scrollTop;
      }
    }
  }, [scrollTop, scrollSource]);

  // After setting scroll, reset scrollSource to null
  React.useEffect(() => {
    if (scrolling.current && scrollSource !== "distributor") {
      scrolling.current = false;
      setScrollTop(scrollTop); // This will set source to 'distributor' in parent
    }
  }, [scrollTop, scrollSource, setScrollTop]);

  // On scroll, update parent if source is not distributor
  function handleScroll() {
    if (scrollableRef.current) {
      if (!scrolling.current) {
        setScrollTop(scrollableRef.current.scrollTop);
      }
    }
  }

  if (!currentDistributor) {
    return (
      <div className="flex flex-col h-full p-4">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-4">
          Distributor Prices
        </h2>
        <p className="text-gray-500 pt-4">No distributor data available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b sticky top-0 bg-white z-20 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Distributor Prices
        </h2>
        <div className="flex items-center space-x-4">
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
              aria-label="Previous distributor"
              disabled={distributors.length <= 1}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextDistributor}
              className="px-2 py-1 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              aria-label="Next distributor"
              disabled={distributors.length <= 1}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div
        id="distributorTableScrollable"
        ref={scrollableRef}
        className="flex-grow overflow-y-auto max-h-[calc(100vh-35rem)]"
        onScroll={handleScroll}
      >
        <InfiniteScroll
          dataLength={currentDistributorPrices.length}
          next={() => {}}
          hasMore={hasMore}
          loader={isLoadingMore ? <TableLoader /> : null}
          scrollableTarget="distributorTableScrollable"
          endMessage={
            <tr>
              <td
                colSpan={tableHeader.length}
                className="text-center text-gray-500 py-4"
              >
                {currentDistributorPrices.length > 0
                  ? "No more prices to load."
                  : ""}
              </td>
            </tr>
          }
          className="min-w-full"
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-primary text-white sticky top-0 z-10">
              <tr>
                {tableHeader.map((header) => (
                  <th
                    key={header}
                    className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentDistributorPrices.map((price) => (
                <tr
                  key={price.irc + "-" + distributors[currentIndex].id}
                  onClick={() => setSelectedRow(price.irc as string)}
                  className={cn(
                    "cursor-pointer hover:bg-primary/10 ",
                    selectedRow === price.irc
                      ? "bg-primary/30"
                      : " odd:bg-white even:bg-[#F2F4F6]"
                  )}
                >
                  {tableFields.map((field) => {
                    const value = price[field as keyof typeof price];

                    if (field === "billing_price") {
                      return (
                        <td
                          key={field}
                          className="text-sm text-gray-900 relative"
                        >
                          {editingPrice?.irc === price.irc ? (
                            <input
                              type="number"
                              value={editingPrice.price}
                              onChange={handlePriceChange}
                              onBlur={handlePriceBlur}
                              autoFocus
                              className="w-20 border border-gray-300 rounded px-1 py-0.5 text-sm"
                              step="0.01"
                            />
                          ) : (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePriceEdit(
                                  price.irc as string,
                                  Number(value)
                                );
                              }}
                              className="cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5"
                            >
                              ${Number(value).toFixed(2)}
                              <div className="absolute top-1 right-0">
                                <ExclamationTooltip />
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    }

                    if (field === "rrsp") {
                      return (
                        <td
                          key={field}
                          className="text-sm text-gray-900 relative"
                        >
                          {editingRRSP?.irc === price.irc ? (
                            <input
                              type="number"
                              value={editingRRSP.rrsp}
                              onChange={handleRRSPChange}
                              onBlur={handleRRSPBlur}
                              autoFocus
                              className="w-20 border border-gray-300 rounded px-1 py-0.5 text-sm"
                              step="0.01"
                            />
                          ) : (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRRSPEdit(
                                  price.irc as string,
                                  Number(value)
                                );
                              }}
                              className="cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5"
                            >
                              ${Number(value).toFixed(2)}
                              <div className="absolute top-1 right-0">
                                <ExclamationTooltip />
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    }
                    if (field === "c1") {
                      return (
                        <td
                          key={field}
                          className="text-sm text-gray-900 relative"
                        >
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRRSPEdit(
                                price.irc as string,
                                Number(value)
                              );
                            }}
                            className="cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5"
                          >
                            ${Number(value).toFixed(2)}
                            <div className="absolute top-1 right-0">
                              <ExclamationTooltip />
                            </div>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={field}
                        className="text-sm text-gray-900 relative"
                      >
                        {value ?? "-"}
                        <div className="absolute top-1 right-0">
                          <ExclamationTooltip />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default DistributorPrices;
