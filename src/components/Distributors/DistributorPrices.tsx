import { cn } from "@/lib/utils";
import { MasterDistributor } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Table } from "@mantine/core";

interface DistributorPricesProps {
  distributors: MasterDistributor[];
  selectedRow: string | null;
  setSelectedRow: (irc: string | null) => void;
  tableHeader: string[];
  tableFields: string[];
  scrollTop: number;
  setScrollTop: (scrollTop: number) => void;
  scrollSource: "product" | "distributor" | null;
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

  // Infinite scroll state for distributor prices
  const PAGE_SIZE = 20;
  type PriceType = MasterDistributor["data"][number];
  const [currentDistributorPrices, setCurrentDistributorPrices] = useState<
    PriceType[]
  >([]);
  const [hasMorePrices, setHasMorePrices] = useState(true);
  const [isLoadingMorePrices, setIsLoadingMorePrices] = useState(false);

  // Update prices when distributor changes
  useEffect(() => {
    if (distributors[currentIndex]) {
      setCurrentDistributorPrices(
        distributors[currentIndex].data.slice(0, PAGE_SIZE)
      );
      setHasMorePrices(distributors[currentIndex].data.length > PAGE_SIZE);
    }
  }, [currentIndex, distributors]);

  // Fetch more prices for infinite scroll
  const fetchMoreDistributorPrices = async () => {
    if (!distributors[currentIndex]) return;
    setIsLoadingMorePrices(true);
    // Simulate async fetch
    await new Promise((resolve) => setTimeout(resolve, 300));
    const allPrices = distributors[currentIndex].data;
    const nextLength = currentDistributorPrices.length + PAGE_SIZE;
    setCurrentDistributorPrices(allPrices.slice(0, nextLength));
    setHasMorePrices(allPrices.length > nextLength);
    setIsLoadingMorePrices(false);
  };

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

  console.log({ distributors });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-20">
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
        className="flex-grow overflow-y-auto max-h-[calc(100vh-28rem)]"
        ref={scrollableRef}
        onScroll={handleScroll}
      >
        <InfiniteScroll
          dataLength={currentDistributorPrices.length}
          next={fetchMoreDistributorPrices}
          hasMore={hasMorePrices}
          loader={
            isLoadingMorePrices ? (
              <div className="text-center py-2">Loading...</div>
            ) : null
          }
          endMessage={
            <div className="text-center text-gray-500 py-2">
              {currentDistributorPrices.length > 0
                ? "No more prices to load."
                : ""}
            </div>
          }
        >
          <Table
            verticalSpacing="sm"
            borderColor="transparent"
            striped="even"
            stripedColor="#F2F4F6"
          >
            <Table.Thead>
              <Table.Tr className="bg-primary text-white">
                {tableHeader.map((header, index) => (
                  <Table.Th
                    key={header}
                    className={cn(
                      "text-white font-medium",
                      index === 0 && "rounded-ss-xl",
                      index === tableHeader.length - 1 && "rounded-se-xl"
                    )}
                  >
                    {header}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {currentDistributorPrices.map((price) => (
                <Table.Tr
                  key={price.irc + "-" + distributors[currentIndex].id}
                  onClick={() => setSelectedRow(price.irc as string)}
                  className={cn(
                    "cursor-pointer",
                    selectedRow === price.irc && "bg-primary/30"
                  )}
                >
                  {tableFields.map((field) => {
                    if (field === "billing_price") {
                      return (
                        <Table.Td key={field}>
                          {editingPrice && editingPrice.irc === price.irc ? (
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
                                  Number(price.billing_price)
                                );
                              }}
                              className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded min-h-[22px]"
                            >
                              ${Number(price.billing_price).toFixed(2)}
                            </div>
                          )}
                        </Table.Td>
                      );
                    }
                    if (field === "rrsp") {
                      return (
                        <Table.Td key={field}>
                          {editingRRSP && editingRRSP.irc === price.irc ? (
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
                                  Number(price.rrsp)
                                );
                              }}
                              className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded min-h-[22px]"
                            >
                              ${Number(price.rrsp).toFixed(2)}
                            </div>
                          )}
                        </Table.Td>
                      );
                    }
                    return (
                      <Table.Td key={field}>
                        {(price as Record<string, string | number | null>)[
                          field
                        ] ?? "-"}
                      </Table.Td>
                    );
                  })}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default DistributorPrices;
