import { Product } from "@/types";

export interface OfferingProductData {
  irc: string;
  material_description?: string;
  icp_cost: number;
  price: number;
  currency: "EUR" | "USD";
  brand_id: string;
  sub_brand_id?: string;
  product_type: "saleable" | "non-saleable";
  pref: "pref" | "non-pref";
  grouping: "1" | "2" | "3";
}

export interface Offering {
  id?: number;
  number: string;
  icw: Date;
  ocd: Date;
  type: string;
  deck: string;
  market_deck: string;
  products: Array<{
    irc: string;
    currency: string;
    price: number;
    icp_cost: number;
    product_type: string;
    pref: string;
    grouping: string;
    material_description?: string;
    brand_id: string;
    sub_brand_id?: string;
  }>;
}

export interface OfferingTableProps {
  offerings: Offering[];
  onAdd: (offering: Offering) => void;
  onEdit: (index: number, offering: Offering) => void;
  onDelete: (index: number) => void;
  innovationId: string;
}

export interface OfferingMappedProduct {
  id?: number;
  irc: string;
  currency: string;
  price: number;
  icp_cost: number;
  product_type: string;
  pref: string;
  grouping: string;
  material_description?: string;
  brand_id: string;
  sub_brand_id?: string;
  brand_type?: string | null;
  brand_category?: string | null;
  launch_date?: Date | null;
  discontinue_date?: Date | null;
  offering_number?: string | null;
  sku?: string;
  material_tr?: string | null;
  ean_upc?: string | null;
  house?: string | null;
  line?: string | null;
  line_id?: string | null;
  article_sub_type?: string | null;
  division?: string | null;
  icp_eur?: string | null;
  icp_usd?: string | null;
  factory?: string | null;
  commodity_id?: string | null;
  gender?: string | null;
  size?: string | null;
  length?: string | null;
  height?: string | null;
  width?: string | null;
  volume?: string | null;
  gross_weight?: string | null;
  net_weight?: string | null;
  units?: string | null;
  cssp_trex_eur?: string | null;
  cssp_trex_usd?: string | null;
  shade?: string | null;
  is_innovation_product?: boolean;
  created_at?: string;
  brand?: {
    id: number;
    name: string;
    type: string;
    created_at: string;
  } | null;
  brand_pillar?: {
    id: number;
    name: string;
    created_at: string;
    brand: {
      id: number;
      name: string;
      type: string;
      created_at: string;
    };
  } | null;
  category?: {
    id: number;
    name: string;
    created_at: string;
  } | null;
  country?: {
    id: number;
    name: string;
    official_name: string;
    iso2: string;
    iso3: string;
    flag_url: string;
    created_at: string;
  } | null;
  market?: {
    id: number;
    name: string;
    created_at: string;
  } | null;
  subcategory?: {
    id: number;
    name: string;
    created_at: string;
  } | null;
  segment?: {
    id: number;
    name: string;
    created_at: string;
  } | null;
  price_benchmark?: import("@/types").PriceBenchmark | null;
}

export interface PriceBenchmark {
  brand_id: string;
  product_id: string;
  index_value: number;
  comment: string;
}

export interface DistributorPrice {
  irc: string;
  billing_price: number;
  rrsp: number;
  c1: number;
}

export interface DistributorData {
  id: number;
  name: string;
  data: DistributorPrice[];
}

export interface OfferingFormState {
  number: string;
  deadline: Date;
  icw: Date;
  ocd: Date;
  type: string;
  deck: string;
  market_deck: string;
}

export interface OfferingProductTableState {
  isEdit: boolean;
}

export interface DistributorPriceState {
  selectedRow: string | null;
  scrollTop: number;
  scrollSource: "product" | "distributor" | null;
}

export const BRAND_TYPE_MASS = "Mass" as const;
