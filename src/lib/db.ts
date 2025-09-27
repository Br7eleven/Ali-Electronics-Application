// db.ts
import { supabase } from "./supabase";
import type { Product, Client, Bill, NewBill, Payment } from "../types";

export const db = {
  // Products
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase.from("products").select("*");
    if (error) throw error;
    return data || [];
  },

  async addProduct(product: Omit<Product, "id" | "created_at">): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .insert([product])
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .update(product)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  },

  // Clients
  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase.from("clients").select("*");
    if (error) throw error;
    return data || [];
  },

  async addClient(client: Omit<Client, "id" | "created_at">): Promise<Client> {
    const { data, error } = await supabase
      .from("clients")
      .insert([client])
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async updateClient(id: string, client: Partial<Client>): Promise<Client> {
    const { data, error } = await supabase
      .from("clients")
      .update(client)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  // Bills
  async getBills(): Promise<Bill[]> {
    const { data, error } = await supabase
      .from("bills")
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
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getBill(billId: string): Promise<Bill | null> {
    const { data, error } = await supabase
      .from("bills")
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
      .eq("id", billId)
      .single();

    if (error) {
      console.error("Error fetching bill:", error);
      return null;
    }
    return data;
  },

  async addBill(bill: NewBill): Promise<Bill> {
    const { data: billData, error: billError } = await supabase
      .from("bills")
      .insert([
        {
          client_id: bill.client_id,
          total: bill.total,
          discount: bill.discount,
        },
      ])
      .select("id")
      .single();

    if (billError || !billData) {
      throw billError || new Error("Failed to create bill");
    }

    const billItems = bill.items.map((item) => ({
      bill_id: billData.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_time: item.price_at_time,
    }));

    const { error: itemsError } = await supabase
      .from("bill_items")
      .insert(billItems);

    if (itemsError) throw itemsError;

    const { data: newBill, error: fetchError } = await supabase
      .from("bills")
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
      .eq("id", billData.id)
      .single();

    if (fetchError || !newBill) {
      throw fetchError || new Error("Failed to fetch bill after creation");
    }

    return newBill as Bill;
  },

  async updateBill(id: string, bill: Partial<Bill>): Promise<Bill> {
    const { data, error } = await supabase
      .from("bills")
      .update(bill)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  // Users (existing logic kept)
  async loginUser(username: string, password: string) {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (error || !user) {
      throw new Error("Invalid credentials");
    }

    const now = new Date();
    if (user.session_token && user.session_expires && new Date(user.session_expires) > now) {
      throw new Error("Already logged in elsewhere");
    }

    const token = crypto.randomUUID();
    const expiry = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const { error: updateError } = await supabase
      .from("users")
      .update({
        session_token: token,
        session_expires: expiry.toISOString(),
      })
      .eq("id", user.id);

    if (updateError) throw updateError;

    return { token, expiry };
  },

  async validateSession(token: string) {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("session_token", token)
      .single();

    if (error || !user) return null;

    const now = new Date();
    if (!user.session_expires || new Date(user.session_expires) < now) {
      return null;
    }

    return user;
  },

  async logoutUser(token: string) {
    const { error } = await supabase
      .from("users")
      .update({
        session_token: null,
        session_expires: null,
      })
      .eq("session_token", token);

    if (error) throw error;
  },

  // ================= Payments =================

  // get all payments (joined)
  async getPayments(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        client:clients(id, name, phone),
        bill:bill(id)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // get payments filtered by client
  async getPaymentsByClient(clientId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        client:clients(id, name, phone),
        bill:bills(id)
      `)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // get bills for a specific client with payments (one call)
  async getBillsWithPayments(clientId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("bills")
      .select(`
        *,
        client:clients(id, name, phone),
        payments:payments(*)
        
      `)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // advance payments (no bill linked)
  async getAdvancePayments(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        client:clients(id, name, phone)
      `)
      .is("bill_id", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // insert payment (bill_id optional)
  async addPayment(payment: {
    client_id: string;
    bill_id?: string | null;
    total: number;
    paid?: number;
    comment?: string | null;
  }): Promise<Payment> {
    const { data, error } = await supabase
      .from("payments")
      .insert([payment])
      .select(`
        *,
        client:clients(id, name, phone),
        bill:bills(id)
      `)
      .single();

    if (error) throw error;

    // history log (use sensible fields)
    await supabase.from("payments_history").insert({
      payment_id: data.id,
      bill_id: data.bill_id,
      client_id: data.client_id,
      total: data.total,
      paid: data.paid,
      comment: data.comment,
      action: "INSERT",
      created_at: new Date().toISOString(),
    });

    return data;
  },

  // update payment (bill_id may be set later to link advance)
  async updatePayment(
    id: string,
    updates: Partial<{
      client_id: string;
      bill_id?: string | null;
      total: number;
      paid: number;
      comment?: string | null;
    }>
  ): Promise<Payment> {
    const { data, error } = await supabase
      .from("payments")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        client:clients(id, name, phone),
        bill:bills(id)
      `)
      .single();

    if (error) throw error;

    await supabase.from("payments_history").insert({
      payment_id: data.id,
      bill_id: data.bill_id,
      client_id: data.client_id,
      total: data.total,
      paid: data.paid,
      comment: data.comment,
      action: "UPDATE",
      created_at: new Date().toISOString(),
    });

    return data;
  },

  // delete payment
  async deletePayment(id: string): Promise<void> {
    // return deleted row so we can log it
    const { data, error } = await supabase
      .from("payments")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from("payments_history").insert({
      payment_id: data.id,
      bill_id: data.bill_id,
      client_id: data.client_id,
      total: data.total,
      paid: data.paid,
      comment: data.comment,
      action: "DELETE",
      created_at: new Date().toISOString(),
    });
  },
};
export default db;