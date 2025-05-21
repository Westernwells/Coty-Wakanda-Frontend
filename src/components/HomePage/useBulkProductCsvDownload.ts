import { useState, useEffect, useCallback, useRef } from "react";
import { getProducts } from "@/api/products/get-products";
import { Product, Filters } from "@/types";

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

function isFilterEmpty(filter?: Filters) {
  if (!filter) return true;
  return (
    !filter.search &&
    !filter.region_id &&
    !filter.market_id &&
    !filter.brand_id &&
    !filter.sub_brand_id &&
    !filter.distributor_id &&
    !filter.division
  );
}

export function useBulkProductCsvDownload(filter?: Filters) {
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
        const res = isFilterEmpty(filter)
          ? await getProducts({ cursor, page_size: 100 })
          : await getProducts({ cursor, page_size: 100, filter });
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
  }, [filter]);

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
