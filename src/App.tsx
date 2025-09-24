import { useState, useEffect } from "react";
import { BillForm } from "./components/BillForm";
import { ProductList } from "./components/ProductList";
import { ProductForm } from "./components/ProductForm";
import { ClientForm } from "./components/ClientForm";
import { BillHistory } from "./components/BillHistory";
import { Login } from "./components/Login";
import type { Product, Client, Bill } from "./types";
import { supabase } from "./lib/supabase";
import { db } from "./lib/db";
import { Toaster } from "react-hot-toast";

const INACTIVITY_LIMIT = 2 * 60 * 60 * 1000; // 2 hours in ms

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "clients" | "billing" | "history">("products");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [billSearchTerm, setBillSearchTerm] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    const storedLoggedIn = localStorage.getItem("loggedIn");
    const storedLastActivity = localStorage.getItem("lastActivity");

    if (storedLoggedIn === "true") {
      setLoggedIn(true);
      setLastActivity(storedLastActivity ? parseInt(storedLastActivity) : Date.now());
    }
  }, []);

  useEffect(() => {
    if (loggedIn) {
      loadProducts();
      loadClients();
      loadBills();
    }
  }, [loggedIn]);

  useEffect(() => {
    const checkInactivity = () => {
      if (Date.now() - lastActivity > INACTIVITY_LIMIT) {
        handleLogout();
      }
    };

    const interval = setInterval(checkInactivity, 60 * 1000); // check every minute
    return () => clearInterval(interval);
  }, [lastActivity]);

  const refreshActivity = () => {
  const now = Date.now();
  setLastActivity(now);
  localStorage.setItem("lastActivity", now.toString()); // save last activity
};

  const handleLogin = async (username: string, password: string) => {
  if (username === "admin" && password === "72926") {
    setLoggedIn(true);
    localStorage.setItem("loggedIn", "true"); // persist login
    localStorage.setItem("lastActivity", Date.now().toString()); // store last activity
    refreshActivity();
  } else {
    alert("Invalid credentials");
  }
};

 const handleLogout = () => {
  setLoggedIn(false);
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("lastActivity");
};

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadClients = async () => {
    try {
      const clients = await db.getClients();
      setClients(clients);
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  const loadBills = async () => {
    try {
      const bills = await db.getBills();
      setBills(bills);
    } catch (error) {
      console.error("Error loading bills:", error);
    }
  };

  const handleProductAdded = async (productData: Omit<Product, "id" | "created_at">) => {
    try {
      const newProduct = await db.addProduct(productData);
      if (newProduct) setProducts((prev) => [...prev, newProduct]);
      setShowProductForm(false);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleClientAdded = async (clientData: Omit<Client, "id" | "created_at">) => {
    try {
      const newClient = await db.addClient(clientData);
      if (newClient) setClients((prev) => [...prev, newClient]);
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  const handleBillGenerated = (bill: Bill) => {
    setBills((prev) => [bill, ...prev]);
    loadProducts();
  };

  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50" onClick={refreshActivity} onKeyDown={refreshActivity} onMouseMove={refreshActivity}>
      <Toaster position="top-right" />

      {/* Logout button */}
      <header className="bg-white shadow flex justify-between items-center px-4 py-4">
        <img src="/logo.png" alt="Logo" className="w-40 flex mx-4" />
        <button onClick={handleLogout} className="bg-red-500 text-white mx-4 px-3 py-1 rounded hover:bg-red-600">
          Logout
        </button>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-3 py-4 text-sm font-medium border-b-2 -mb-px ${activeTab === "products" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab("clients")}
              className={`px-3 py-4 text-sm font-medium border-b-2 -mb-px ${activeTab === "clients" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
            >
              Customer
            </button>
            <button
              onClick={() => setActiveTab("billing")}
              className={`px-3 py-4 text-sm font-medium border-b-2 -mb-px ${activeTab === "billing" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
            >
              Billing
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-4 text-sm font-medium border-b-2 -mb-px ${activeTab === "history" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
            >
              Bill History
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {activeTab === 'products' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Products</h2>
                  <button
                    onClick={() => setShowProductForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Product
                  </button>
                </div>
                {showProductForm ? (
                  <ProductForm onSubmit={handleProductAdded} onCancel={() => setShowProductForm(false)} />
                ) : (
                  <ProductList products={products} onProductUpdate={loadProducts} />
                )}
              </>
            )}

            {activeTab === 'clients' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Customers</h2>
                  <input
                    type="text"
                    placeholder="Search Customers..."
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    className="shadow-sm bg-zinc-50 border-2 border-blue-700 focus:border-green-700  block w-64 rounded-md "
                  />
                </div>
                <ClientForm onSubmit={handleClientAdded} />
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Customer List</h3>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clients.filter(client =>
                        client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                        client.phone.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                        client.address.toLowerCase().includes(clientSearchTerm.toLowerCase())
                      ).map((client) => (
                        <tr key={client.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.phone}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{client.address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {clients.filter(client =>
                    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                    client.phone.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                    client.address.toLowerCase().includes(clientSearchTerm.toLowerCase())
                  ).length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No Customer found
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Create New Bill</h2>
                <BillForm
                  products={products}
                  clients={clients}
                  onBillGenerated={handleBillGenerated}
                />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Bill History</h2>
                  <input
                    type="text"
                    placeholder="Search bills..."
                    value={billSearchTerm}
                    onChange={(e) => setBillSearchTerm(e.target.value)}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-64 sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <BillHistory bills={bills} searchTerm={billSearchTerm} />
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="text-center text-sm text-zinc-500 py-4 ">
      BR7 Technologies & Co.
    </footer>
    </div>
  );
}