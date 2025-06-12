import { Product } from '@/types/InnovationOfferProduct';
import { useMemo } from 'react';

const useBrandAndProductData = (products: Product[], selectedBrand: number | null) => {
  const brands = useMemo(() => {
    const uniqueBrandsMap = new Map();
    products.forEach(product => {
      const brand = product?.brand_pillar?.brand;
      if (brand && !uniqueBrandsMap.has(brand.id)) {
        uniqueBrandsMap.set(brand.id, {
          value: String(brand.id),
          label: brand.name,
        });
      }
    });
    return Array.from(uniqueBrandsMap.values());
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!selectedBrand) return [];
    return products
      .filter(product => product?.brand_pillar?.brand?.id == selectedBrand)
      .map(product => ({
        value: String(product.id),
        label: product.material_description || product.id.toString(),
      }));
  }, [products, selectedBrand]);

  return { brands, filteredProducts };
};

export default useBrandAndProductData;