export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
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

export interface ServiceItem {
  id: string;
  service_bill_id: string;
  service_id: string;
  service_name?: string;
  quantity: number;
  price_at_time: number;
  service?: Service;
}

export interface ServiceBill {
  id: string;
  client_id: string;
  client_name?: string;
  total: number;
  discount: number;
  created_at: string;
  items?: ServiceItem[];
  client?: Client;
  service_items?: ServiceItem[];
}
// For creating BillItems (no id, no bill_id at the start)
export type NewBillItem = Omit<BillItem, "id" | "bill_id">;

// For creating a new Bill (no id, no created_at, items are NewBillItem[])
export type NewBill = Omit<Bill, "id" | "created_at" | "items"> & {
  items: NewBillItem[];
}

// For creating ServiceItems (no id, no service_bill_id at the start)
export type NewServiceItem = Omit<ServiceItem, "id" | "service_bill_id">;

// For creating a new ServiceBill (no id, no created_at, items are NewServiceItem[])
export type NewServiceBill = Omit<ServiceBill, "id" | "created_at" | "items"> & {
  items: NewServiceItem[];
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