import { Innovation } from "@/types";

export interface Offering {
  id?: number;
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
}

export interface InnovationWithOfferings extends Innovation {
  offerings: Offering[];
  status: string;
}

export interface InnovationWithStatus extends Innovation {
  status: string;
}

export interface FlattenedOffering extends Offering {
  brand: Innovation['brand'];
  status: InnovationWithStatus['status'];
  innovationId: number;
}

export interface ApiResponse<T = any> {
  message: string;
  data: T;
  meta?: {
    cursor: number;
    page_size: number;
    has_previous: boolean;
    has_next: boolean;
    total: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface ForecastProduct {
  offering_number: number
  brand?: {
    name: string;
  };
  brand_pillar?: {
    name: string;
    brand?: {
      name: string;
    };
  };
  sku?: string;
  price?: number;
  product_type?: string;
}

export interface DateValues {
  value: string | number;
  is_closed?: boolean;
}

export interface ForecastDetailsData {
  forecast_deadline: string;
  product: ForecastProduct;
  unit_forecast: Record<string, DateValues>;
}

export interface TransformedForecastRow {
  brand: string;
  pillar: string;
  sku: string;
  launchId: string;
  cost: string;
  [key: string]: string;
}

export interface TransformedForecast {
  offeringNumber: string;
  data: TransformedForecastRow[];
} 