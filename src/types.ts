export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'canceled';
  createdAt?: any;
  updatedAt?: any;
}

export type ViewPage = 'home' | 'shop' | 'admin';
