import React from "react";
import { Grid } from "@mantine/core";
import CombinedInnovationTables from "../../CombinedInnovationTables";
import { OfferingMappedProduct, DistributorData, BRAND_TYPE_MASS } from "../types";
import { Product } from "@/types";

interface ProductTableContentProps {
  offeringId: number;
  innovationId: string;
  products: OfferingMappedProduct[];
  distributors: DistributorData[];
  isEdit: boolean;
  setIsEdit: (isEdit: boolean | ((prevState: boolean) => boolean)) => void;
  onProductSelect: (product: Product) => void;
  selectedProducts: number[];
  onSelectedProductsChange: (productIds: number[]) => void;
  onLocalEdit: (product: Product) => void;
  onLocalDelete: (product: Product) => void;
  isDeleteMode: boolean;
  brandOptions: Array<{ value: string; label: string }>;
  brandPillarOptions: Array<{ value: string; label: string }>;
}

export const ProductTableContent: React.FC<ProductTableContentProps> = ({
  offeringId,
  innovationId,
  products,
  distributors,
  isEdit,
  setIsEdit,
  onProductSelect,
  selectedProducts,
  onSelectedProductsChange,
  onLocalEdit,
  onLocalDelete,
  isDeleteMode,
  brandOptions,
  brandPillarOptions,
}) => {
  const mappedProducts = products.map((p) => ({
    id: p.id || 0,
    pref: p.pref,
    product_type: p.product_type,
    brand_category: p.brand_category,
    brand_pillar: p.brand_pillar,
    grouping: Number(p.grouping),
    price: String(p.price),
    launch_date: new Date(),
    discontinue_date: new Date(),
    irc: p.irc,
    sku: p.irc,
    material_description: p.material_description || "",
    ean_upc: p.ean_upc || "",
    house: p.house || "",
    line: p.line || "",
    line_id: p.line_id || "",
    line_number: p.line_number || "",
    offering_number: p.offering_number || "",
    article_type: p.product_type,
    article_sub_type: p.article_sub_type || "",
    division: p.division || "",
    segment: {
      id: 0,
      name: "",
      created_at: "",
    },
    icp_eur: p.currency === "EUR" ? String(p.icp_cost) : "0",
    icp_usd: p.currency === "USD" ? String(p.icp_cost) : "0",
    factory: p.factory || "",
    commodity_id: p.commodity_id || "",
    gender: p.gender || "",
    size: p.size || "",
    length: p.length || "",
    height: p.height || "",
    width: p.width || "",
    volume: p.volume || "",
    gross_weight: p.gross_weight || "",
    net_weight: p.net_weight || "",
    units: p.units || "",
    created_at: p.created_at || "",
    brand: {
      id: Number(p.brand_id) || 0,
      brand_type_id: 0,
      name: "",
      active: true,
      type: BRAND_TYPE_MASS,
      created_at: "",
      updated_at: "",
      deleted_at: null,
      pivot: {
        distributor_id: 0,
        brand_id: Number(p.brand_id) || 0,
      },
    },
    pricing: {
      distributor_id: 0,
      icp_usd: p.currency === "USD" ? p.icp_cost : 0,
      icp_eur: p.currency === "EUR" ? p.icp_cost : 0,
      french_usd: null,
      french_eur: null,
      rrsp: null,
      regional_billing_price: null,
      c1: null,
      cssp: null,
      status: "",
    },
    category: {
      id: 0,
      name: "",
      created_at: "",
    },
    country: {
      id: 0,
      name: "",
      official_name: "",
      iso2: "",
      iso3: "",
      flag_url: "",
      created_at: "",
    },
    market: null,
    subcategory: {
      id: 0,
      name: "",
      created_at: "",
    },
    price_benchmark: null,
    documents: [],
    distributor_pricing: [],
    gmm_category: {
      id: 0,
      name: "",
      created_at: "",
    },
    gmm_subCategory: {
      id: 0,
      name: "",
      created_at: "",
    },
    gmm_market: {
      id: 0,
      name: "",
      created_at: "",
    },
    gmm_segment: {
      id: 0,
      name: "",
      created_at: "",
    },
  }));

  return (
    <Grid gutter="lg">
      <Grid.Col>
        <CombinedInnovationTables
          products={mappedProducts}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          onProductSelect={onProductSelect}
          brandOptions={brandOptions}
          brandPillarOptions={brandPillarOptions}
          onBulkUpdate={(products) => {
            console.log("Bulk update:", products);
          }}
          selectedProducts={selectedProducts}
          onSelectedProductsChange={onSelectedProductsChange}
          distributors={distributors}
          tableHeader={["Distributor IRC", "Price", "RRSP"]}
          tableFields={["irc", "billing_price", "rrsp"]}
          onPriceEdit={(irc, price) => {
            console.log("Price edit:", irc, price);
          }}
          onRRSPEdit={(irc, rrsp) => {
            console.log("RRSP edit:", irc, rrsp);
          }}
          innovationId={innovationId}
          offeringId={offeringId.toString()}
          onLocalEdit={onLocalEdit}
          onLocalDelete={onLocalDelete}
          isDeleteMode={isDeleteMode}
        />
      </Grid.Col>
    </Grid>
  );
};

export default ProductTableContent;
