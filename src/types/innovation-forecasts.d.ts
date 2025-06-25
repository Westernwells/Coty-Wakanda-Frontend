export interface Brand {
    id: number;
    name: string;
  }
  
  export interface BrandPillar {
    id: number;
    name: string;
  }
  
  export interface InnovationForecastProduct {
    id: number;
    offering_number: string;
    sku: string;
    launch_id: string;
    brand: Brand[] | Brand;        
    brand_pillar: BrandPillar;
  }
  
  export interface InnovationForecastItem {
    product: InnovationForecastProduct;
    cost: number;
    monthly_total: number;
    sub_total: number;
    items: Record<
      string,
      {
        value: number;
        is_closed: boolean;
      }
    >;
  }
  
  export interface InnovationForecastsApiResponse {
    message: string;
    data: {
      forecast: InnovationForecastItem[];
    };
  }
  