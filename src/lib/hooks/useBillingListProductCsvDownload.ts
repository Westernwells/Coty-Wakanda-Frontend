import { useState, useEffect, useCallback, useRef } from "react";
import { getMasterData } from "@/api/products/master-data";
import type {
  MasterProduct,
  MasterProductFilters as MasterProductFiltersType,
} from "@/types";

export interface BillingListCsvProductRow {
  productId: string | number;
  materialDescription: string | null;
  brandLine: string | null;
  house: string | null;
  irc: string | null;
}

export const BILLING_LIST_CSV_HEADERS = [
  { label: "House", key: "house" },
  { label: "Description", key: "materialDescription" },
  { label: "Brand Line", key: "brandLine" },
  { label: "Article Type", key: "articleType" }, // Note: articleType is not in BillingListCsvProductRow, consider adding or removing
  { label: "IRC", key: "irc" },
  { label: "Group", key: "group" }, // Note: group is not in BillingListCsvProductRow, consider adding or removing
];

function mapMasterProductToCsvRow(
  product: MasterProduct
): BillingListCsvProductRow {
  const p = product as any; // Keep existing cast, acknowledge potential type mismatch
  return {
    productId: p.id ?? "N/A",
    materialDescription: p.material_description ?? "",
    brandLine: p.brand_line ?? "",
    house: p.house ?? "",
    irc: p.irc ?? "",
    // Missing articleType and group from headers if not added here
  };
}

export function useBillingListProductCsvDownload(
  filters: MasterProductFiltersType
) {
  const [csvData, setCsvData] = useState<BillingListCsvProductRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<
    { label: string; key: string }[]
  >([]);
  const [csvError, setCsvError] = useState<Error | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvReady, setCsvReady] = useState(false);
  const csvLinkRef = useRef<any>(null);

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
      setCsvHeaders(BILLING_LIST_CSV_HEADERS);
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
