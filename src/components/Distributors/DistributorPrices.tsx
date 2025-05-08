import { cn } from "@/lib/utils";
import { MasterDistributor } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";

interface DistributorPricesProps {
  distributors: MasterDistributor[];
  selectedRow: string | null;
  setSelectedRow: (irc: string | null) => void;
  tableRef: React.RefObject<HTMLDivElement>;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
}

const DistributorPrices: React.FC<DistributorPricesProps> = ({
  distributors,
  selectedRow,
  setSelectedRow,
  tableRef,
  onScroll,
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

  const nextDistributor = () => {
    setCurrentIndex((prev) => (prev + 1) % distributors.length);
  };

  const prevDistributor = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + distributors.length) % distributors.length
    );
  };

  const currentDistributor = distributors[currentIndex];

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

  return (
    <div className="">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Distributor Prices
        </h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-600">
            {currentDistributor.name}
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={prevDistributor}
              className="px-2 py-1 rounded-lg hover:bg-gray-100"
              aria-label="Previous distributor"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextDistributor}
              className="px-2 py-1 rounded-lg hover:bg-gray-100"
              aria-label="Next distributor"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={tableRef}
        onScroll={onScroll}
        className="overflow-y-auto max-h-[calc(100vh-24rem)]"
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Billing Price
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                RRSP
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                C1
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                French USD
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                French EUR
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentDistributor.data.map((price) => (
              <tr
                key={price.irc}
                onClick={() => setSelectedRow(price.irc)}
                className={cn(
                  "cursor-pointer hover:bg-primary/10",
                  selectedRow === price.irc && "bg-primary/30"
                )}
              >
                <td className="px-2 py-1 text-sm text-gray-900">
                  {editingPrice?.irc === price.irc ? (
                    <input
                      type="number"
                      value={editingPrice.price}
                      onChange={handlePriceChange}
                      onBlur={handlePriceBlur}
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
                      className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
                    >
                      ${Number(price.billing_price).toFixed(2)}
                    </div>
                  )}
                </td>
                <td className="px-2 py-1 text-sm text-gray-900">
                  {editingRRSP?.irc === price.irc ? (
                    <input
                      type="number"
                      value={editingRRSP.rrsp}
                      onChange={handleRRSPChange}
                      onBlur={handleRRSPBlur}
                      className="w-20 border border-gray-300 rounded px-1 py-0.5 text-sm"
                      step="0.01"
                    />
                  ) : (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRRSPEdit(price.irc as string, Number(price.rrsp));
                      }}
                      className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
                    >
                      ${Number(price.rrsp).toFixed(2)}
                    </div>
                  )}
                </td>
                <td className="px-2 py-1 text-sm text-gray-900">{price.c1}</td>
                <td className="px-2 py-1 text-sm text-gray-900">
                  {price.french_eur}
                </td>
                <td className="px-2 py-1 text-sm text-gray-900">
                  {price.french_usd}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DistributorPrices;
