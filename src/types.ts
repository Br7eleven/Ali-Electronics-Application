export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface BillItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Bill {
  id: string;
  clientId: string;
  date: string;
  items: BillItem[];
  total: number;
}