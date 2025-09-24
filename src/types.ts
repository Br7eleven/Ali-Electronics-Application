export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  created_at: string;
  
}

export interface BillItem {
  id: string;
  bill_id: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  price_at_time: number;
}

export interface Bill {
  id: string;
  client_id: string;
  client_name?: string;
  total: number;
  discount: number;
  created_at: string;
  items?: BillItem[];
  client?: Client;
}
// For creating BillItems (no id, no bill_id at the start)
export type NewBillItem = Omit<BillItem, "id" | "bill_id">;

// For creating a new Bill (no id, no created_at, items are NewBillItem[])
export type NewBill = Omit<Bill, "id" | "created_at" | "items"> & {
  items: NewBillItem[];
};
