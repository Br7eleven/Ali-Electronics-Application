import { Toaster, toast } from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { BillForm } from "./components/BillForm";
import { ProductList } from "./components/ProductList";
import { ProductForm } from "./components/ProductForm";
import { ClientForm } from "./components/ClientForm";
import { BillHistory } from "./components/BillHistory";
import { Payments } from "./components/Payments";
import { Login } from "./components/Login";
import type { Product, Client, Bill } from "./types";
import { supabase } from "./lib/supabase";
import { db } from "./lib/db";

const INACTIVITY_LIMIT = 2 * 60 * 60 * 1000; // 2 hours

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [billSearchTerm, setBillSearchTerm] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  type Tab = "products" | "clients" | "billing" | "history" | "payments";
  const [activeTab, setActiveTab] = useState<Tab>("products");

  const tabs: { tab: Tab; label: string }[] = [
    { tab: "products", label: "Products" },
    { tab: "clients", label: "Customers" },
    { tab: "billing", label: "Billing" },
    { tab: "history", label: "Bill History" },
    { tab: "payments", label: "Payments / Loan" },
  ];

  // Canvas background ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Example background (grid dots)
      ctx.fillStyle = "rgba(34,197,94,0.2)";
      for (let x = 0; x < canvas.width; x += 40) {
        for (let y = 0; y < canvas.height; y += 40) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Session handling
  useEffect(() => {
    const token = localStorage.getItem("sessionToken");
    if (!token) return;

    db.validateSession(token).then((user) => {
      if (user) {
        setLoggedIn(true);
        setLastActivity(Date.now());
      } else {
        handleLogout();
      }
    });
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
    const interval = setInterval(checkInactivity, 60 * 1000);
    return () => clearInterval(interval);
  }, [lastActivity]);

  const refreshActivity = () => {
    const now = Date.now();
    setLastActivity(now);
    localStorage.setItem("lastActivity", now.toString());
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      const { token, expiry } = await db.loginUser(username, password);
      localStorage.setItem("sessionToken", token);
      localStorage.setItem("sessionExpiry", expiry.toString());
      setLoggedIn(true);
      refreshActivity();
    } catch (err: any) {
      if (err.message === "Already logged in elsewhere") {
        toast.error("Already logged in elsewhere");
      } else if (err.message === "Invalid credentials") {
        toast.error("Invalid username or password");
      } else {
        toast.error("Login failed");
      }
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("sessionToken");
    if (token) await db.logoutUser(token);
    setLoggedIn(false);
    localStorage.clear();
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

  const handleProductAdded = async (
    productData: Omit<Product, "id" | "created_at">
  ) => {
    try {
      const newProduct = await db.addProduct(productData);
      if (newProduct) setProducts((prev) => [...prev, newProduct]);
      setShowProductForm(false);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleClientAdded = async (
    clientData: Omit<Client, "id" | "created_at">
  ) => {
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
    <div
      className="relative min-h-screen bg-zinc-100 flex flex-col"
      onClick={refreshActivity}
      onKeyDown={refreshActivity}
      onMouseMove={refreshActivity}
    >
      {/* Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 -z-10"
      ></canvas>

      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <img src="/logo.png" alt="Logo" className="w-32 sm:w-40" />
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex space-x-2 sm:space-x-6 overflow-x-auto no-scrollbar py-2">
            {tabs.map(({ tab, label }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-2 rounded-md text-sm font-medium transition ${
                  activeTab === tab
                    ? "bg-green-100 text-zinc-700 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 sm:p-6">
            {activeTab === "products" && (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Inventory
                  </h2>
                  <button
                    onClick={() => setShowProductForm(true)}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 text-sm font-medium shadow-sm transition w-full sm:w-auto"
                  >
                    Add Product
                  </button>
                </div>
                {showProductForm ? (
                  <ProductForm
                    onSubmit={handleProductAdded}
                    onCancel={() => setShowProductForm(false)}
                  />
                ) : (
                  <ProductList products={products} onProductUpdate={loadProducts} />
                )}
              </>
            )}

            {activeTab === "clients" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Customers
                  </h2>
                </div>
                <ClientForm onSubmit={handleClientAdded} />
                <div className="mt-6">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
                    Customer List
                  </h3>
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    className="w-full  sm:w-64 rounded-md border border-gray-300 bg-zinc-50 px-3 py-2 my-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <div className="overflow-x-auto border rounded-md">
                    <table className="min-w-full text-sm text-gray-900">
                      <thead className="bg-zinc-700 text-zinc-50">
                        <tr>
                          <th className="px-4 py-2 text-left">ID</th>
                          <th className="px-4 py-2 text-left">Name</th>
                          <th className="px-4 py-2 text-left">Phone</th>
                          <th className="px-4 py-2 text-left">Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {clients
                          .filter(
                            (c) =>
                              c.id.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                              c.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                              c.phone.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                              c.address.toLowerCase().includes(clientSearchTerm.toLowerCase())
                          )
                          .map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2">{c.id.slice(0, 8)}</td>
                              <td className="px-4 py-2">{c.name}</td>
                              <td className="px-4 py-2">{c.phone}</td>
                              <td className="px-4 py-2">{c.address}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  {clients.filter(
                    (c) =>
                      c.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                      c.phone.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                      c.address.toLowerCase().includes(clientSearchTerm.toLowerCase())
                  ).length === 0 && (
                    <div className="text-center py-6 text-gray-500">No customer found</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="space-y-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Create New Bill
                </h2>
                <BillForm
                  products={products}
                  clients={clients}
                  onBillGenerated={handleBillGenerated}
                />
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Bill History
                  </h2>
                  <input
                    type="text"
                    placeholder="Search bills..."
                    value={billSearchTerm}
                    onChange={(e) => setBillSearchTerm(e.target.value)}
                    className="w-full sm:w-64 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <BillHistory bills={bills} searchTerm={billSearchTerm} />
              </div>
            )}

            {activeTab === "payments" && <Payments />}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t py-4 text-center text-xs sm:text-sm text-gray-500">
        BR7 Technologies & Co.
      </footer>
    </div>
  );
}
