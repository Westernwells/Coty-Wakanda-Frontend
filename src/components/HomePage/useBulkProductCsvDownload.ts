import { useState, useEffect, useCallback, useRef } from "react";
import { getProducts } from "@/api/products/get-products";
import { Product } from "@/types";

export interface CsvProductRow {
  [key: string]: string | number | null;
}

export const CSV_HEADERS = [
  { label: "Brand", key: "brand" },
  { label: "Brand Type", key: "brandType" },
  { label: "Brand Pillar", key: "brandPillar" },
  { label: "Description", key: "description" },
  { label: "IRC", key: "irc" },
  { label: "ICP EU", key: "icpEur" },
  { label: "ICP USD", key: "icpUsd" },
  { label: "Status", key: "statusPref" },
  { label: "Status", key: "statusType" },
];

function mapProductToCsvRow(product: Product): CsvProductRow {
  return {
    brand: product.brand?.name ?? "",
    brandType: product.brand?.type ?? "",
    brandPillar: product.brand_pillar?.name ?? "",
    description: product.material_description ?? "",
    irc: product.irc ?? "",
    icpEur: product.icp_eur ?? "",
    icpUsd: product.icp_usd ?? "",
    statusPref: product.pref ?? "",
    statusType: product.product_type ?? "",
  };
}

export function useBulkProductCsvDownload() {
  const [csvData, setCsvData] = useState<CsvProductRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<
    { label: string; key: string }[]
  >([]);
  const [csvError, setCsvError] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvReady, setCsvReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const csvLinkRef = useRef<any>(null);

  useEffect(() => {
    if (csvReady && csvLinkRef.current?.link) {
      csvLinkRef.current.link.click();
      setTimeout(() => setCsvReady(false), 500);
    }
  }, [csvReady]);

  const handleBulkDownload = useCallback(async () => {
    setCsvLoading(true);
    setCsvError(false);
    try {
      let all: Product[] = [];
      let cursor = 1;
      let hasNext = true;
      while (hasNext) {
        const res = await getProducts({ cursor, page_size: 100 });
        all = all.concat(res.data);
        hasNext = res.meta.has_next;
        cursor = res.meta.cursor;
        if (!hasNext) break;
        cursor += 1;
      }
      const csvRows = all.map(mapProductToCsvRow);
      setCsvData(csvRows);
      setCsvHeaders(CSV_HEADERS);
      setCsvReady(true);
      setCsvLoading(false);
    } catch {
      setCsvError(true);
      setCsvLoading(false);
    }
  }, []);

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
