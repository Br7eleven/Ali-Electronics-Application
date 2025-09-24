import { supabase } from './supabase';
import type { Product, Client, Bill, NewBill } from '../types';

export const db = {
  // Products
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return data || [];
  },

  async addProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  // Clients
  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) throw error;
    return data || [];
  },

  async addClient(client: Omit<Client, 'id' | 'created_at'>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async updateClient(id: string, client: Partial<Client>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .update(client)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  // Bills
  async getBills(): Promise<Bill[]> {
  const { data, error } = await supabase
    .from('bills')
    .select(`
      *,
      client:clients(
        id,
        name,
        phone,
        address
      ),
      bill_items(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
},
  //added this new function for the inovice view
 async getBill(billId: string): Promise<Bill | null> {
  const { data, error } = await supabase
    .from('bills')
    .select(`
      *,
      client:clients(
        id,
        name,
        phone,
        address
      ),
      bill_items(*)
    `)
    .eq('id', billId)
    .single();

  if (error) {
    console.error('Error fetching bill:', error);
    return null;
  }
  return data;
},

  async addBill(bill: NewBill): Promise<Bill> {
  // Insert bill (with discount)
  const { data: billData, error: billError } = await supabase
    .from('bills')
    .insert([
      {
        client_id: bill.client_id,
        total: bill.total,
        discount: bill.discount,
      },
    ])
    .select('id')
    .single();

  if (billError || !billData) {
    throw billError || new Error('Failed to create bill');
  }

  // Insert items separately into bill_items
  const billItems = bill.items.map(item => ({
    bill_id: billData.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_time: item.price_at_time,
  }));

  const { error: itemsError } = await supabase
    .from('bill_items')
    .insert(billItems);

  if (itemsError) throw itemsError;

  // Fetch the newly created bill with client and items
  const { data: newBill, error: fetchError } = await supabase
    .from('bills')
    .select(`
      *,
      client:clients(
        id,
        name,
        phone,
        address
      ),
      bill_items(*)
    `)
    .eq('id', billData.id)
    .single();

  if (fetchError || !newBill) {
    throw fetchError || new Error('Failed to fetch bill after creation');
  }

  return newBill as Bill;
},


  async updateBill(id: string, bill: Partial<Bill>): Promise<Bill> {
    const { data, error } = await supabase
      .from('bills')
      .update(bill)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
};
