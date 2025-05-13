import { cn } from "@/lib/utils";
import { MasterDistributor } from "@/types";
import React, { useState } from "react";

interface AddBillingListDistributorPricesProps {
  distributors: MasterDistributor[];
  selectedRow: string | null;
  setSelectedRow: (irc: string | null) => void;
  tableHeader: string[];
  tableFields: string[];
}

const AddBillingListDistributorPrices: React.FC<
  AddBillingListDistributorPricesProps
> = ({
  distributors,
  selectedRow,
  setSelectedRow,
  tableHeader,
  tableFields,
}) => {
  const [currentIndex] = useState(0);
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
    // TODO: Here you would typically update the price in your main form state for AddBillingList
    console.log("Price edit blurred for", editingPrice);
  };

  const handleRRSPBlur = () => {
    setEditingRRSP(null);
    // TODO: Here you would typically update the RRSP in your main form state for AddBillingList
    console.log("RRSP edit blurred for", editingRRSP);
  };

  if (!currentDistributor) {
    return (
      <div className="flex flex-col h-full p-4">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-4">
          Distributor Prices
        </h2>
        <p className="text-gray-500 pt-4">
          No distributor data available for this billing list.
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
            {currentDistributor.data.map((priceInfo) => (
              <tr
                key={priceInfo.irc + "-" + currentDistributor.id}
                onClick={() => setSelectedRow(priceInfo.irc as string)}
                className={cn(
                  "cursor-pointer hover:bg-primary/10",
                  selectedRow === priceInfo.irc && "bg-primary/30"
                )}
              >
                {tableFields.map((field) => {
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
                                Number(priceInfo.billing_price)
                              );
                            }}
                            className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded min-h-[22px]"
                          >
                            ${Number(priceInfo.billing_price).toFixed(2)}{" "}
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
                                Number(priceInfo.rrsp)
                              );
                            }}
                            className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded min-h-[22px]"
                          >
                            ${Number(priceInfo.rrsp).toFixed(2)}{" "}
                          </div>
                        )}
                      </td>
                    );
                  }
                  return (
                    <td key={field} className="px-2 py-1 text-sm text-gray-900">
                      {(priceInfo as Record<string, string | number | null>)[
                        field
                      ] ?? "-"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddBillingListDistributorPrices;
