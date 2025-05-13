import { cn } from "@/lib/utils";
import { MasterDistributor } from "@/types"; // Assuming MasterDistributor is still relevant
import React, { useState } from "react";

interface AddPricingListDistributorPricesProps {
  // Renamed interface
  distributors: MasterDistributor[];
  selectedRow: string | null;
  setSelectedRow: (irc: string | null) => void;
  // These might be fixed for AddPricingList or made configurable later
  tableHeader: string[];
  tableFields: string[];
}

// Renamed component
const AddPricingListDistributorPrices: React.FC<
  AddPricingListDistributorPricesProps
> = ({
  distributors,
  selectedRow,
  setSelectedRow,
  tableHeader,
  tableFields,
}) => {
  const [currentIndex] = useState(0);
  // The editing state might need to be adapted or connected to the AddPricingList form state
  const [editingPrice, setEditingPrice] = useState<{
    irc: string;
    price: number;
  } | null>(null);
  const [editingRRSP, setEditingRRSP] = useState<{
    irc: string;
    rrsp: number;
  } | null>(null);

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
    // TODO: Here you would typically update the price in your main form state for AddPricingList
    console.log("Price edit blurred for", editingPrice);
  };

  const handleRRSPBlur = () => {
    setEditingRRSP(null);
    // TODO: Here you would typically update the RRSP in your main form state for AddPricingList
    console.log("RRSP edit blurred for", editingRRSP);
  };

  if (!currentDistributor) {
    return (
      <div className="flex flex-col h-full p-4">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-4">
          Distributor Prices
        </h2>
        <p className="text-gray-500 pt-4">
          No distributor data available for this pricing list.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-20">
        <h2 className="text-xl font-semibold text-gray-800">Base Prices</h2>
      </div>

      <div className="flex-grow overflow-y-auto max-h-[calc(100vh-28rem)]">
        {/* This max-height might need adjustment */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {tableHeader.map((header) => (
                <th
                  key={header}
                  className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentDistributor.data.map(
              (
                priceInfo // Renamed `price` to `priceInfo` to avoid conflict with editingPrice state
              ) => (
                <tr
                  key={priceInfo.irc + "-" + currentDistributor.id}
                  onClick={() => setSelectedRow(priceInfo.irc as string)}
                  className={cn(
                    "cursor-pointer hover:bg-primary/10",
                    selectedRow === priceInfo.irc && "bg-primary/30"
                  )}
                >
                  {tableFields.map((field) => {
                    // Special handling for editable fields
                    if (field === "billing_price") {
                      return (
                        <td
                          key={field}
                          className="px-2 py-1 text-sm text-gray-900"
                        >
                          {editingPrice?.irc === priceInfo.irc ? (
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
                                  priceInfo.irc as string,
                                  Number(priceInfo.billing_price) // priceInfo used here
                                );
                              }}
                              className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded min-h-[22px]"
                            >
                              ${Number(priceInfo.billing_price).toFixed(2)}{" "}
                              {/* priceInfo used here */}
                            </div>
                          )}
                        </td>
                      );
                    }
                    if (field === "rrsp") {
                      return (
                        <td
                          key={field}
                          className="px-2 py-1 text-sm text-gray-900"
                        >
                          {editingRRSP?.irc === priceInfo.irc ? (
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
                                  priceInfo.irc as string,
                                  Number(priceInfo.rrsp) // priceInfo used here
                                );
                              }}
                              className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded min-h-[22px]"
                            >
                              ${Number(priceInfo.rrsp).toFixed(2)}{" "}
                              {/* priceInfo used here */}
                            </div>
                          )}
                        </td>
                      );
                    }
                    // Default rendering for other fields
                    return (
                      <td
                        key={field}
                        className="px-2 py-1 text-sm text-gray-900"
                      >
                        {(priceInfo as Record<string, string | number | null>)[
                          field
                        ] ?? "-"}
                      </td>
                    );
                  })}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddPricingListDistributorPrices; // Renamed export
