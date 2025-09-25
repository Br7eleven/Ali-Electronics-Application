import { supabase } from './supabase';
import type { Product, Client, Bill, NewBill } from '../types';
// import { v4 as uuidv4 } from "uuid";


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
  //new function for delete product
async deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
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
      bill_items(
        id,
        quantity,
        price_at_time,
        product:products(
          id,
          name,
          price
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
},

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
      bill_items(
        id,
        quantity,
        price_at_time,
        product:products(
          id,
          name,
          price
        )
      )
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
    bill_items(
      id,
      quantity,
      price_at_time,
      product:products(
        id,
        name,
        price
      )
    )
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

  // User Login
  // User Login (single device restriction)
async loginUser(username: string, password: string) {
  // Check credentials
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password) // plaintext for now
    .single();

  if (error || !user) {
    throw new Error('Invalid credentials');
  }

  // Check active session
  const now = new Date();
  if (user.session_token && user.session_expires && new Date(user.session_expires) > now) {
    throw new Error('Already logged in elsewhere');
  }

  // Create new session
  const token = crypto.randomUUID(); // instead of uuidv4()
  const expiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

  const { error: updateError } = await supabase
    .from('users')
    .update({
      session_token: token,
      session_expires: expiry.toISOString(),
    })
    .eq('id', user.id);

  if (updateError) throw updateError;

  return { token, expiry };
},

  // Validate session
  async validateSession(token: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('session_token', token)
      .single();

    if (error || !user) return null;

    const now = new Date();
    if (!user.session_expires || new Date(user.session_expires) < now) {
      return null; // expired
    }

    return user;
  },

  // Logout
  async logoutUser(token: string) {
    const { error } = await supabase
      .from('users')
      .update({
        session_token: null,
        session_expires: null,
      })
      .eq('session_token', token);

    if (error) throw error;
  },
  //till here...
};




