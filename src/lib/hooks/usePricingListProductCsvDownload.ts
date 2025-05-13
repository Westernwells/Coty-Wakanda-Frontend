import { useState, useEffect, useCallback, useRef } from "react";
import { getMasterData } from "@/api/products/master-data";
import type {
  MasterProduct,
  MasterProductFilters as MasterProductFiltersType,
} from "@/types";

// Define the structure for a row in the CSV
export interface PricingListCsvProductRow {
  // Assuming these fields exist based on their usage for filters/options
  // If MasterProduct type is more limited, this needs adjustment
  productId: string | number; // Assuming 'id' exists on MasterProduct
  materialDescription: string | null; // Assuming 'material_description' exists
  brandLine: string | null;
  house: string | null;
  irc: string | null; // Assuming 'irc' exists
}

// Define the CSV headers
export const PRICING_LIST_CSV_HEADERS = [
  { label: "House", key: "house" },
  { label: "Description", key: "materialDescription" },
  { label: "Brand Line", key: "brandLine" },
  { label: "Article Type", key: "articleType" },
  { label: "IRC", key: "irc" },
  { label: "Group", key: "group" },
];

// Helper function to map a MasterProduct to a CsvProductRow
function mapMasterProductToCsvRow(
  product: MasterProduct
): PricingListCsvProductRow {
  // Casting to any temporarily to bypass potential MasterProduct type issues
  // This should be revisited once MasterProduct's actual shape is confirmed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = product as any;
  return {
    productId: p.id ?? "N/A",
    materialDescription: p.material_description ?? "",
    brandLine: p.brand_line ?? "",
    house: p.house ?? "",
    irc: p.irc ?? "",
  };
}

export function usePricingListProductCsvDownload(
  filters: MasterProductFiltersType
) {
  const [csvData, setCsvData] = useState<PricingListCsvProductRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<
    { label: string; key: string }[]
  >([]);
  const [csvError, setCsvError] = useState<Error | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvReady, setCsvReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const csvLinkRef = useRef<any>(null); // For react-csv CSVLink component

  useEffect(() => {
    if (csvReady && csvLinkRef.current?.link) {
      csvLinkRef.current.link.click();
      const timer = setTimeout(() => setCsvReady(false), 500);
      return () => clearTimeout(timer);
    }
  }, [csvReady]);

  const handleBulkDownload = useCallback(async () => {
    setCsvLoading(true);
    setCsvError(null);
    setCsvData([]);
    setCsvHeaders([]);

    try {
      let allProducts: MasterProduct[] = [];
      let currentCursor: number | string | null = 1;
      let hasMoreData = true;
      const pageSize = 100;

      while (hasMoreData && currentCursor !== null) {
        const response = await getMasterData({
          cursor: currentCursor,
          page_size: pageSize,
          filter: filters,
        });

        if (response.data?.products) {
          allProducts = allProducts.concat(response.data.products);
        }

        hasMoreData = response.meta.has_next;
        currentCursor = response.meta.cursor;

        if (!hasMoreData) {
          break;
        }
      }

      const csvRows = allProducts.map(mapMasterProductToCsvRow);
      setCsvData(csvRows);
      setCsvHeaders(PRICING_LIST_CSV_HEADERS);
      setCsvReady(true);
    } catch (error) {
      console.error("Error downloading product list CSV:", error);
      setCsvError(
        error instanceof Error ? error : new Error("An unknown error occurred")
      );
    } finally {
      setCsvLoading(false);
    }
  }, [filters]);

  return {
    csvData,
    csvHeaders,
    csvError,
    csvLoading,
    csvReady,
    csvLinkRef,
    handleBulkDownload,
  };
}
