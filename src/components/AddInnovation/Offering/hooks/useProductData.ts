import { getOfferingProducts, OfferingProductData } from "@/api/products/get-offering-products";
import { queryClient } from "@/main";
import { useState } from "react";
import { DistributorData, OfferingMappedProduct } from "../types";

export const useProductData = (innovationId: string) => {
  const [offeringProducts, setOfferingProducts] = useState<
    Record<string, OfferingMappedProduct[]>
  >({});
  const [offeringDistributors, setOfferingDistributors] = useState<
    Record<number, DistributorData[]>
  >({});
  const [loadingOfferings, setLoadingOfferings] = useState<Set<number>>(
    new Set()
  );

  const fetchOfferingProducts = async (offeringId: number) => {
    if (!innovationId || !offeringId) return;

    setLoadingOfferings((prev) => new Set(prev).add(offeringId));
    try {

      const response = await queryClient.fetchQuery({
        queryKey: ["offering-products", innovationId, offeringId],
        queryFn: () => getOfferingProducts(innovationId, offeringId),
      }
      );
      const { products, distributors } = response.data;

      const mappedProducts: OfferingMappedProduct[] = products.map((p) => ({
        id: p.id,
        irc: p.irc || "",
        currency: (p as any).currency || (p.icp_usd && !p.icp_eur ? "USD" : "EUR"),
        price:
          typeof p.price === "number"
            ? p.price
            : Number(p.icp_eur || p.icp_usd || 0),
        icp_cost: p.icp_eur
          ? Number(p.icp_eur)
          : p.icp_usd
            ? Number(p.icp_usd)
            : 0,
        product_type: p.product_type || p.article_type || "",
        pref: p.pref || "non-pref",
        grouping: p.grouping ? String(p.grouping) : "1",
        material_description: p.material_description || "",
        brand_id: p.brand?.id ? String(p.brand.id) : "",
        sub_brand_id: p.brand_pillar?.id ? String(p.brand_pillar.id) : "",
        brand_type: p.brand_type || null,
        brand_category: p.brand_category || null,
        launch_date: p.launch_date ? new Date(p.launch_date) : null,
        discontinue_date: p.discontinue_date
          ? new Date(p.discontinue_date)
          : null,
        offering_number: p.offering_number || null,
        sku: p.sku || "",
        material_tr: p.material_tr || null,
        ean_upc: p.ean_upc || null,
        house: p.house || null,
        line: p.line || null,
        line_id: p.line_id || null,
        article_sub_type: p.article_sub_type || null,
        division: p.division || null,
        icp_eur: p.icp_eur || null,
        icp_usd: p.icp_usd || null,
        factory: p.factory || null,
        commodity_id: p.commodity_id || null,
        gender: p.gender || null,
        size: p.size || null,
        length: p.length || null,
        height: p.height || null,
        width: p.width || null,
        volume: p.volume || null,
        gross_weight: p.gross_weight || null,
        net_weight: p.net_weight || null,
        units: p.units || null,
        cssp_trex_eur: p.cssp_trex_eur || null,
        cssp_trex_usd: p.cssp_trex_usd || null,
        shade: p.shade || null,
        is_innovation_product: p.is_innovation_product,
        created_at: p.created_at,
        brand: p.brand,
        brand_pillar: p.brand_pillar,
        category: p.category,
        country: p.country,
        market: p.market,
        subcategory: p.subcategory,
        segment: p.segment,
        price_benchmark: p.price_benchmark,
      }));

      const distributorsData = distributors.map((d) => ({
        id: d.id,
        name: d.name,
        data: d.data.map((pricing) => ({
          irc: pricing.irc,
          billing_price: Number(pricing.billing_price || 0),
          rrsp: Number(pricing.rrsp || 0),
        })),
      }));

      setOfferingProducts((prev) => ({
        ...prev,
        [offeringId]: mappedProducts,
      }));

      setOfferingDistributors((prev) => ({
        ...prev,
        [offeringId]: distributorsData,
      }));

      return { products: mappedProducts, distributors: distributorsData };
    } catch (error) {
      console.error("Error fetching offering products:", error);
      return { products: [], distributors: [] };
    } finally {
      setLoadingOfferings((prev) => {
        const newSet = new Set(prev);
        newSet.delete(offeringId);
        return newSet;
      });
    }
  };

  const addProductToState = (offeringId: number, product: OfferingMappedProduct) => {
    setOfferingProducts((prev) => ({
      ...prev,
      [offeringId]: [...(prev[offeringId] || []), product],
    }));
  };

  const updateProductInState = (offeringId: number, productId: number, updatedProduct: Partial<OfferingMappedProduct>) => {
    setOfferingProducts((prev) => {
      const offeringProductsCopy = [...(prev[offeringId] || [])];
      const productIndex = offeringProductsCopy.findIndex(p => p.id === productId);
      
      if (productIndex !== -1) {
        offeringProductsCopy[productIndex] = {
          ...offeringProductsCopy[productIndex],
          ...updatedProduct,
        };
      }
      
      return {
        ...prev,
        [offeringId]: offeringProductsCopy,
      };
    });
  };

  const removeProductsFromState = (offeringId: number, productIds: number[]) => {
    setOfferingProducts((prev) => {
      const offeringProductsCopy = (prev[offeringId] || []).filter(
        (p) => !productIds.includes(p.id as number)
      );
      
      return {
        ...prev,
        [offeringId]: offeringProductsCopy,
      };
    });
  };

  return {
    offeringProducts,
    offeringDistributors,
    loadingOfferings,
    fetchOfferingProducts,
    addProductToState,
    updateProductInState,
    removeProductsFromState,
  };
};

export default useProductData;


function mapOfferingProduct(p: OfferingProductData): OfferingMappedProduct {
  return {
    id: p.id,
    irc: p.irc || "",
    currency:
      (p as any).currency ||
      (p.icp_usd && !p.icp_eur ? "USD" : "EUR"),
    price:
      typeof p.price === "number"
        ? p.price
        : Number(p.icp_eur ?? p.icp_usd ?? 0),
    icp_cost: p.icp_eur
      ? Number(p.icp_eur)
      : p.icp_usd
        ? Number(p.icp_usd)
        : 0,
    product_type: p.product_type || p.article_type || "",
    pref: p.pref || "non-pref",
    grouping: p.grouping ? String(p.grouping) : "1",
    material_description: p.material_description || "",
    brand_id: p.brand?.id ? String(p.brand.id) : "",
    sub_brand_id: p.brand_pillar?.id
      ? String(p.brand_pillar.id)
      : "",
    brand_type: p.brand_type ?? null,
    brand_category: p.brand_category ?? null,
    launch_date: p.launch_date ? new Date(p.launch_date) : null,
    discontinue_date: p.discontinue_date
      ? new Date(p.discontinue_date)
      : null,
    offering_number: p.offering_number ?? null,
    sku: p.sku || "",
    material_tr: p.material_tr ?? null,
    ean_upc: p.ean_upc ?? null,
    house: p.house ?? null,
    line: p.line ?? null,
    line_id: p.line_id ?? null,
    article_sub_type: p.article_sub_type ?? null,
    division: p.division ?? null,
    icp_eur: p.icp_eur ?? null,
    icp_usd: p.icp_usd ?? null,
    factory: p.factory ?? null,
    commodity_id: p.commodity_id ?? null,
    gender: p.gender ?? null,
    size: p.size ?? null,
    length: p.length ?? null,
    height: p.height ?? null,
    width: p.width ?? null,
    volume: p.volume ?? null,
    gross_weight: p.gross_weight ?? null,
    net_weight: p.net_weight ?? null,
    units: p.units ?? null,
    cssp_trex_eur: p.cssp_trex_eur ?? null,
    cssp_trex_usd: p.cssp_trex_usd ?? null,
    shade: p.shade ?? null,
    is_innovation_product: p.is_innovation_product ?? false,
    created_at: p.created_at ?? new Date().toISOString(),
    brand: p.brand ?? null,
    brand_pillar: p.brand_pillar ?? null,
    category: p.category ?? null,
    country: p.country ?? null,
    market: p.market ?? null,
    subcategory: p.subcategory ?? null,
    segment: p.segment ?? null,
    price_benchmark: p.price_benchmark ?? null,
  };
}

export function mapOfferingProducts(
  products: OfferingProductData[]
): OfferingMappedProduct[] {
  return products.map(mapOfferingProduct);
}