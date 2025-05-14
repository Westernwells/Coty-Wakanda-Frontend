import { useState, useCallback } from "react";
import {
  getPricingProductList,
  type Product,
} from "@/api/pricingList/get-pricing-product-list";
import type { BillingListFilters } from "@/types/billing-list";

export interface PricingListCsvProductRow {
  id: number;
  product_type: string;
  offering_number: string | null;
  sku: string;
  irc: string;
  material_description: string;
  material_tr: string | null;
  article_type: string;
  article_sub_type: string;
  division: string | null;
  icp_eur: string;
  icp_usd: string;
  cssp_trex_eur: string | null;
  cssp_trex_usd: string | null;
  brand_name: string;
  brand_pillar_name: string;
  price: string | number;
}

export const PRICING_LIST_CSV_HEADERS = [
  { label: "Brand Name", key: "brand_name" },
  { label: "Description", key: "material_description" },
  { label: "Brand Line (Pillar)", key: "brand_pillar_name" },
  { label: "Article Type", key: "article_type" },
  { label: "IRC", key: "irc" },
  { label: "Base Price", key: "price" },
];

function mapProductToCsvRow(product: Product): PricingListCsvProductRow {
  return {
    id: product.id,
    product_type: product.product_type,
    offering_number: product.offering_number,
    sku: product.sku,
    irc: product.irc,
    material_description: product.material_description,
    material_tr: product.material_tr,
    article_type: product.article_type,
    article_sub_type: product.article_sub_type,
    division: product.division,
    icp_eur: product.icp_eur,
    icp_usd: product.icp_usd,
    cssp_trex_eur: product.cssp_trex_eur,
    cssp_trex_usd: product.cssp_trex_usd,
    brand_name: product.brand?.name || "-",
    brand_pillar_name: product.brand_pillar?.name || "-",
    price: product.price || "-",
  };
}

function generateCsvContent(
  data: PricingListCsvProductRow[],
  headers: typeof PRICING_LIST_CSV_HEADERS
): string {
  const headerRow = headers.map((h) => h.label).join(",");
  const dataRows = data.map((row) =>
    headers
      .map((header) => {
        const value = String(
          row[header.key as keyof PricingListCsvProductRow] || ""
        );
        return value.includes(",") ? `"${value}"` : value;
      })
      .join(",")
  );

  return [headerRow, ...dataRows].join("\n");
}

export function usePricingListProductCsvDownload(filters: BillingListFilters) {
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState<Error | null>(null);

  const handleBulkDownload = useCallback(async () => {
    setCsvLoading(true);
    setCsvError(null);

    try {
      let allProducts: Product[] = [];
      let currentCursor: number | null = 1;
      let hasMoreData = true;
      const pageSize = 100;

      while (hasMoreData && currentCursor !== null) {
        const productsResponse = await getPricingProductList({
          cursor: currentCursor,
          page_size: pageSize,
          brand_ids: filters.brand_id ? [Number(filters.brand_id)] : undefined,
        });

        if (!productsResponse?.data) {
          throw new Error("Failed to fetch products data");
        }

        allProducts = allProducts.concat(productsResponse.data);
        hasMoreData = productsResponse.meta.has_next;
        currentCursor = productsResponse.meta.cursor;

        if (!hasMoreData) {
          break;
        }
      }

      const csvRows = allProducts.map(mapProductToCsvRow);
      const csvContent = generateCsvContent(csvRows, PRICING_LIST_CSV_HEADERS);

      // Create and trigger download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `pricing-list-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating CSV:", error);
      setCsvError(
        error instanceof Error ? error : new Error("Failed to generate CSV")
      );
    } finally {
      setCsvLoading(false);
    }
  }, [filters]);

  return {
    csvLoading,
    csvError,
    handleBulkDownload,
  };
}
