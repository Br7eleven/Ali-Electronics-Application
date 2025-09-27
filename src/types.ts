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
  product?: Product;
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
  bill_items?: BillItem[];
}
// For creating BillItems (no id, no bill_id at the start)
export type NewBillItem = Omit<BillItem, "id" | "bill_id">;

// For creating a new Bill (no id, no created_at, items are NewBillItem[])
export type NewBill = Omit<Bill, "id" | "created_at" | "items"> & {
  items: NewBillItem[];
}
export type Payment = {
  id: string
  client_id: string
  bill_id?: string | null
  total: number
  paid: number
  due: number
  status: 'Unpaid' | 'Partially Paid' | 'Paid'
  comment?: string | null
  created_at: string
  client?: {
    id: string
    name: string
    phone?: string
  }
  bill?: {
    id: string
    invoice_no?: string
  }
}

export type PaymentHistory = {
  id: string
  payment_id: string
  amount: number
  note?: string | null
  created_at: string
};