interface SampleProduct {
  id: number;
  pref: string;
  brand_type: unknown;
  brand_category: string;
  product_type: string;
  grouping: number;
  price: number;
  launch_date: string;
  discontinue_date: string;
  offering_number: string;
  sku: string;
  irc: string;
  material_description: string;
  material_tr: unknown;
  ean_upc: string;
  house: string;
  line: string;
  line_id: string;
  article_type: string;
  article_sub_type: unknown;
  division: string;
  icp_eur: unknown;
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
  cssp_trex_eur: unknown;
  cssp_trex_usd: unknown;
  shade: unknown;
  currency: string;
  is_innovation_product: boolean;
  created_at: string;
  brand: { id: number; name: string } | null;
  brand_pillar: { id: number; name: string } | null;
  category: { id: number; name: string; created_at?: string } | null;
  country: {
    id: number;
    name: string;
    official_name: string;
    iso2: string;
    iso3: string;
    flag_url: string;
    created_at: string;
  };
  market: { id: number; name: string; created_at?: string };
  subcategory: { id: number; name: string; created_at?: string };
  segment: { id: number; name: string; created_at?: string };
  price_benchmark: {
    id: number;
    index_value: string;
    comment: string;
    created_at: string;
    brand: unknown;
    category: unknown;
  };
}

const SAMPLE_DATA: SampleProduct[] = [
  {
    id: 2581,
    pref: "pref",
    brand_type: null,
    brand_category: "formal",
    product_type: "saleable",
    grouping: 1,
    price: 4444,
    launch_date: "2025-07-17",
    discontinue_date: "2025-07-24",
    offering_number: "44",
    sku: "HUG-CO-0189",
    irc: "44444",
    material_description: "4444",
    material_tr: null,
    ean_upc: "44",
    house: "44",
    line: "44",
    line_id: "44",
    article_type: "saleable",
    article_sub_type: null,
    division: "luxury",
    icp_eur: "0",
    icp_usd: "4444",
    factory: "44",
    commodity_id: "44",
    gender: "male",
    size: "44",
    length: "44",
    height: "4",
    width: "44",
    volume: "44",
    gross_weight: "44",
    net_weight: "44",
    units: "44",
    cssp_trex_eur: null,
    cssp_trex_usd: null,
    shade: null,
    currency: "USD",
    is_innovation_product: true,
    created_at: "2025-06-04T09:19:56.000000Z",
    brand: null,
    brand_pillar: { id: 132, name: "Boss Bottled" },
    category: { id: 3, name: "Traditional Fragrance" },
    country: {
      id: 167,
      name: "Barbados",
      official_name: "Barbados",
      iso2: "BB",
      iso3: "BRB",
      flag_url: "https:flagcdn.combb.svg",
      created_at: "2024-12-18T00:39:23.000000Z",
    },
    market: { id: 27, name: "Concealers" },
    subcategory: { id: 4, name: "EDP" },
    segment: { id: 58, name: "Pen" },
    price_benchmark: {
      id: 36,
      index_value: "12.00",
      comment: "xcvndghjjkhj",
      created_at: "2025-06-09T10:16:56.000000Z",
      brand: null,
      category: null,
    },
  },
];

const HEADERS = [
  "IRC",
  "ICP Cost",
  "Currency",
  "Brand ID",
  "Sub Brand ID",
  "Product Type",
  "Pref",
  "Grouping",
  "Division",
  "Brand Category",
  "EAN/UPC",
  "House",
  "Line",
  "Article Type",
  "Offering Number",
  "Launch Date",
  "Discontinue Date",
  "Category ID",
  "Subcategory ID",
  "Market ID",
  "Segment ID",
  "ICP EUR",
  "ICP USD",
  "Factory",
  "Commodity ID",
  "Country ID",
  "Gender",
  "Size",
  "Length",
  "Height",
  "Width",
  "Volume",
  "Gross Weight",
  "Net Weight",
  "Units",
  "Price",
];

export function downloadSampleProductCsv() {
  const rows = SAMPLE_DATA.map((p) => {
    const brandId = p.brand?.id ?? "";
    const subBrandId = p.brand_pillar?.id ?? "";
    const categoryId = p.category?.id ?? "";
    const subcategoryId = p.subcategory?.id ?? "";
    const marketId = p.market?.id ?? "";
    const segmentId = p.segment?.id ?? "";
    const countryId = p.country?.id ?? "";

    return [
      p.irc,
      p.icp_usd, // ICP Cost
      p.currency,
      brandId,
      subBrandId,
      p.product_type,
      p.pref,
      p.grouping,
      p.division,
      p.brand_category,
      p.ean_upc,
      p.house,
      p.line,
      p.article_type,
      p.offering_number,
      p.launch_date,
      p.discontinue_date,
      categoryId,
      subcategoryId,
      marketId,
      segmentId,
      p.icp_eur ?? "",
      p.icp_usd,
      p.factory,
      p.commodity_id,
      countryId,
      p.gender,
      p.size,
      p.length,
      p.height,
      p.width,
      p.volume,
      p.gross_weight,
      p.net_weight,
      p.units,
      p.price,
    ].map((cell) => `"${cell}"`); 
  });

  const csvContent =
    HEADERS.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", "sample-products.csv");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
