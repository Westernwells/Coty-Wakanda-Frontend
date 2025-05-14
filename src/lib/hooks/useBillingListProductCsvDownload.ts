import { useState, useCallback } from "react";
import {
  getBillingListByBrandType,
  getBillingListByBillingId,
} from "@/api/billingList/get-billing-list";
import { type Product } from "@/api/billingList/get-billing-product-list";

interface AddModeOptions {
  mode: "add";
  brandType: string;
  filters?: { brand_id?: string; brand_pillar_id?: string };
}

interface EditModeOptions {
  mode: "edit";
  billingId: string;
  brandType: string;
  filters?: { brand_id?: string; brand_pillar_id?: string };
}

type HookOptions = AddModeOptions | EditModeOptions;

export interface BillingListCsvProductRow {
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

export const BILLING_LIST_CSV_HEADERS = [
  { label: "Brand Name", key: "brand_name" },
  { label: "Description", key: "material_description" },
  { label: "Brand Line (Pillar)", key: "brand_pillar_name" },
  { label: "Article Type", key: "article_type" },
  { label: "IRC", key: "irc" },
  { label: "Base Price", key: "price" },
];

function mapProductToCsvRow(product: Product): BillingListCsvProductRow {
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
  data: BillingListCsvProductRow[],
  headers: typeof BILLING_LIST_CSV_HEADERS
): string {
  const headerRow = headers.map((h) => h.label).join(",");
  const dataRows = data.map((row) =>
    headers
      .map((header) => {
        const value = String(
          row[header.key as keyof BillingListCsvProductRow] || ""
        );
        return value.includes(",") ? `"${value}"` : value;
      })
      .join(",")
  );

  return [headerRow, ...dataRows].join("\n");
}

export function useBillingListProductCsvDownload(options: HookOptions) {
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState<Error | null>(null);

  const handleBulkDownload = useCallback(async () => {
    setCsvLoading(true);
    setCsvError(null);

    try {
      const brandIds = options.filters?.brand_id
        ? options.filters.brand_id
            .split(",")
            .map(Number)
            .filter((id) => !isNaN(id) && id !== null)
        : undefined;

      let productsResponse;

      if (options.mode === "edit") {
        productsResponse = await getBillingListByBillingId({
          billingId: options.billingId,
          brandType: options.brandType,
          brandIds: brandIds,
          cursor: 1,
          pageSize: 1,
          forceDoNotPaginate: true,
        });
      } else {
        productsResponse = await getBillingListByBrandType({
          brandType: options.brandType,
          brandIds: brandIds,
          cursor: 1,
          pageSize: 1,
          forceDoNotPaginate: true,
        });
      }

      if (!productsResponse?.data) {
        throw new Error("Failed to fetch products data for CSV download");
      }

      const allProducts = productsResponse.data;
      const csvRows = allProducts.map(mapProductToCsvRow);
      const csvContent = generateCsvContent(csvRows, BILLING_LIST_CSV_HEADERS);

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `billing-list-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating CSV for billing list:", error);
      setCsvError(
        error instanceof Error
          ? error
          : new Error("Failed to generate CSV for billing list")
      );
    } finally {
      setCsvLoading(false);
    }
  }, [options]);

  return {
    csvLoading,
    csvError,
    handleBulkDownload,
  };
}
