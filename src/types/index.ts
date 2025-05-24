export type Meta = {
  page: number;
  total: number;
  page_size: number;
  cursor: number;
  has_next: boolean;
};

export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
}

export type Distributor = {
  id: number;
  name: string;
  type: string;
  company_registration_number: string;
  currency: string;
  contact_person: string;
  contact_email: string;
  mirror: Mirror;
  regions: Region[];
  markets: Market[];
  categories: Category[];
  brands: Brand[];
  coefficients: Coefficient[];
  products: ProductBinding[];
};

export type Mirror = {
  group_one: number;
  group_two: number;
};

export type Region = {
  id: number;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  pivot: {
    distributor_id: number;
    region_id: number;
  };
};

export type Market = {
  id: number;
  name: string;
  created_at: string;
};

export type Segment = {
  id: number;
  name: string;
  created_at: string;
};

export type Category = {
  id: number;
  name: string;
  created_at: string;
};

export type Brand = {
  id: number;
  brand_type_id: number;
  name: string;
  active: boolean;
  type: "Luxury" | "Mass";
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  pivot: {
    distributor_id: number;
    brand_id: number;
  };
};

export type BrandPillar = {
  brand: Brand;
  created_at: string;
  id: number;
  name: string;
};

export type Coefficient = {
  id: number;
  type: "regular" | "giftset" | "tester";
  pref_value: string;
  non_pref_value: string;
  brand: Brand;
  category: Category;
  description?: string;
};

export type ProductBinding = {
  pricing: ProductBindingPricing;
  material_description: string;
};

export type ProductBindingPricing = {
  product_id: number;
  distributor_id: number;
  icp_eur: number;
  icp_usd: number;
  french_usd: number;
  french_eur: number;
  rrsp: number;
  regional_billing_price: number;
};

export type Pref = "pref" | "non-pref";

export type LoginValues = {
  email: string;
  password: string;
};

export interface Product {
  id: number;
  pref: string;
  product_type: string;
  brand_pillar: {
    id: number;
    name: string;
  };
  grouping: number;
  price: string;
  launch_date: string | Date;
  discontinue_date: string | Date;
  offering_number: string;
  irc: string;
  sku: string;
  material_description: string;
  ean_upc: string;
  house: string;
  line: string;
  line_id: string;
  line_number: string;
  article_type: string;
  article_sub_type: string;
  division: string;
  segment: Segment;
  icp_eur: string;
  icp_usd: string;
  factory: string;
  commodity_id: string;
  gender: string;
  size: string;
  length: string;
  height: string;
  width: string;
  volume: string;
  gross_weight: string;
  net_weight: string;
  units: string;
  created_at: string;
  brand: Brand;
  pricing: ProductPricing;
  category: Category;
  country: Country;
  market: Market | null;
  subcategory: Subcategory;
  price_benchmark: PriceBenchmark | null;
  documents: Document[];
  distributor_pricing: DistributerPricing[];
  gmm_category: Category;
  gmm_subCategory: Subcategory;
  gmm_market: Market;
  gmm_segment: Segment;
}

export interface Country {
  id: number;
  name: string;
  official_name: string;
  iso2: string;
  iso3: string;
  flag_url: string;
  created_at: string;
}

export interface Subcategory {
  id: number;
  category_id?: number | string;
  name: string;
  created_at: string;
}

export interface Filters {
  search: string;
  category_id?: string;
  brand_id: string;
  sub_brand_id: string;
  distributor_id: string;
  region_id: string;
  market_id: string;
  division?: string;
  brand_type?: string;
}

export interface MasterProductFilters {
  search: string;
  house: string;
  brand_id: string;
  distributor_id: string;
}

export interface BillingListFilters {
  search: string;
  brand_id: string;
  brand_pillar_id: string;
}

export interface PricingListFilters {
  search: string;
  brand_id: string;
  brand_pillar_id: string;
}

export interface BindingFilters {
  brand_id: string;
  sub_brand_id: string;
  brand_type: string;
  pref: string;
  grouping: string;
  product_type: string;
}

export interface ForecastFilters {
  search: string;
  start_date: string;
  end_date: string;
  brand_id: string;
  sub_brand_id: string;
  distributor_id: string;
  launch_id: string;
  sort?: string;
  type?: string;
  brand_type: string;
}

export interface Document {
  title: string;
  url: string;
}

export interface PriceBenchmark {
  brand_id: string | number;
  product_id: string | number;
  index_value: string | number;
  comment: string;
  brand?: Pick<Brand, "id" | "name">;
  product?: Pick<Product, "id">;
}

export interface DistributerPricing {
  distributor_id: number | string;
  coefficient_id: number | string;
  preactive_rrsp: number | string;
  active_rrsp: number | string;
  billing: number | string;
  currency: string;
  distributor: Pick<Distributor, "id" | "name" | "type" | "currency">;
}

export interface MasterProduct {
  house: string;
  description: string;
  brand_line: string;
  article_type: string;
  irc: string;
  icp_eur: string;
  icp_usd: string;
  group: string | null;
}

export interface MasterDistributor {
  id: number;
  name: string;
  currency: string;
  data: {
    product: string;
    irc: string | null;
    icp_eur: string | null;
    icp_usd: string | null;
    french_eur: string | null;
    french_usd: string | null;
    rrsp: string | null;
    billing_price: string | null;
    c1: string | null;
  }[];
}

export interface ProductInput {
  id: number;
  pref: string;
  product_type: string;
  grouping: number | string;
  price: string;
  launch_date: Date;
  discontinue_date: Date;
  offering_number: string;
  irc: string;
  material_description: string;
  ean_upc: string;
  house: string;
  line: string;
  line_id: string;
  line_number: string;
  article_type: string;
  division: string;
  segment_id: string;
  sub_brand_id: string;
  factory: string;
  commodity_id: string;
  gender: string;
  size: string;
  length: string;
  height: string;
  width: string;
  volume: string;
  gross_weight: string;
  net_weight: string;
  units: string;
  created_at: string;
  brand_id: string;
  category_id: string;
  country_id: string;
  market_id: string;
  subcategory_id: string;
  price_benchmark: PriceBenchmark | null | object;
  documents: Document[];
  distributor_pricing: DistributerPricing[];
  documentsPlaceholder: File[];
  gmm_category_id: string;
  gmm_subcategory_id: string;
  gmm_market_id: string;
  gmm_segment_id: string;
  brand_type?: string;
}

export interface ForecastData {
  product: Pick<
    Product,
    "id" | "brand" | "sku" | "material_description" | "offering_number"
  >;
  distributor?: Pick<Distributor, "id" | "name" | "currency">;
  cost: number;
  monthly_total: number;
  sub_total: number;
  items: Record<string, DateValues>;
}

interface DateValues {
  value: string | number;
  forecast_value?: string | number;
  is_closed: boolean;
}

export interface ForecastSubmitInput {
  product_id: number;
  items: ForecastSubmitItem[];
}

export interface ForecastSubmitItem {
  month: string;
  value: number | string;
}

export interface ForecastDetailsData {
  product: Pick<
    Product,
    "id" | "brand" | "material_description" | "offering_number"
  >;
  unit_forecast: Record<string, DateValues>;
  gross_sales: Record<string, DateValues>;
  monthly_average: Record<string, DateValues>;
}

export interface ProductDistributor {
  id: number;
  name: string;
  type: string;
  registered: string;
  coefficients: Pick<Coefficient, "id" | "pref_value" | "non_pref_value">[];
  mirrors: Omit<ProductDistributor, "registered">[];
}

export interface ForecastChartData {
  total_unit: Record<string, number>;
  total_value: Record<string, number>;
}

export interface OrderData {
  product: Pick<Product, "id" | "brand" | "sku" | "material_description">;
  cost: number;
  monthly_total: number;
  sub_total: number;
  items: Record<string, DateValues>;
}

export interface Innovation {
  id: number;
  launch_id: string;
  launch_name: string;
  launch_ref: string;
  year: string;
  format: string;
  forecast_deadline: string;
  created_at: string;
  brand: Pick<Brand, "id" | "name">;
  brand_pillar: BrandPillar;
}

export interface InnovationInput {
  brand_id: string;
  sub_brand_id: string;
  year: string;
  format: string;
  launch_name: string;
  reference_names: string[];
  internal_offering_deck?: string;
  customer_offering_deck?: string;
  status: string;
  forecast_deadline: string;
  offerings?: {
    number: string;
    icw: string;
    ocd: string;
    type: string;
    deck: string;
    market_deck: string;
    products: Array<{
      irc: string;
      currency: string;
      price: number;
    }>;
  }[];
}

export interface InnovationForm {
  brand_id: string;
  sub_brand_id: string;
  year: Date;
  format: string;
  launch_name: string;
  reference_name: string[];
  internal_offering_deck?: string;
  customer_offering_deck?: string;
  status: string;
  forecast_deadline: Date;
  offerings?: {
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
    }>;
  }[];
}

export type PageParams = {
  cursor?: number;
  page_size?: number;
  filter?: GeneralFilters;
  type?: string;
};

export type GeneralFilters = {
  category_id?: string | number;
  region_id?: string | number;
};

export type Royalty = {
  id: number;
  value: number;
  type: string;
  freight: number;
  freight_type: string;
  created_at: string;
  brand: Brand;
};

export interface ProductPrice {
  id: number;
  product_id: number; // if it's part of a larger product object, this might be redundant
  price: number | string;
  // currency?: string; // if currency can vary per price entry
}

export interface PricingListProduct {
  id: number; // This is product_id from the perspective of the pricing list entry
  product_type: string;
  offering_number: string | null;
  sku: string;
  irc: string;
  material_description: string;
  material_tr: string | null;
  article_type: string;
  article_sub_type: string;
  division: string | null;
  icp_eur: string; // These seem like base product properties, not specific to a pricing list entry price
  icp_usd: string;
  cssp_trex_eur: string | null;
  cssp_trex_usd: string | null;
  created_at: string; // Product creation date
  brand: {
    id: number;
    name: string;
    type: string;
    created_at: string;
  };
  brand_pillar: {
    id: number;
    name: string;
    created_at: string;
    brand: {
      id: number;
      name: string;
      type: string;
      created_at: string;
    };
  };
  category: {
    id: number;
    name: string;
    created_at: string;
  };
  base_price: string; // Base product price
  // Pricing specific to this list
  price: number | string; // The actual price for this product in this specific pricing list
}

export interface PricingList {
  id: number;
  name: string;
  type: string;
  description: string | null;
  created_at: string; // Pricing list creation date
  products: PricingListProduct[]; // Array of products with their specific prices for this list
}

export interface BillingList {
  id: number;
  name: string;
  type: string;
  description: string | null;
  created_at: string;
  file: File | null;
  products: BillingListProduct[];
}

export interface BillingListProduct {
  id: number;
  product_id: number;
  price: number;
}

export interface ProductPricing {
  distributor_id: number;
  icp_usd: number | null;
  icp_eur: number | null;
  french_usd: number | null;
  french_eur: number | null;
  rrsp: number | null;
  regional_billing_price: number | null;
  c1: number | null;
  cssp: number | null;
  status: string;
}

export interface PaginationMeta {
  cursor: number;
  page_size: number;
  has_previous: boolean;
  has_next: boolean;
  total: number;
}

export interface ProductListResponse {
  message: string;
  data: Product[];
  meta: PaginationMeta;
}
