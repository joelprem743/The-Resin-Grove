export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviewsCount: number;
  image: string;
  isBestSeller?: boolean;
  description: string;
  dimensions: string;
  materials: string[];
  inStock: boolean;
  features?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  text: string;
  avatar: string;
  date: string;
  verified: boolean;
  productName: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedWood?: string;
  selectedResinColor?: string;
  selectedDeco?: string[];
  personalizationText?: string;
}

export interface CustomDesignRequest {
  baseProduct: string;
  woodType: string;
  resinColor: string;
  decorations: string[];
  personalizationText: string;
  quantity: number;
  contactName: string;
  contactEmail: string;
  additionalDetails: string;
}
