import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import type { Product, Client, Bill } from "../types";
import { toast } from "react-hot-toast";
import { db } from "../lib/db";
import { Invoice } from "./Invoice";

interface BillFormProps {
  products: Product[];
  onBillGenerated?: (bill: Bill) => void;
}

export function BillForm({ products, onBillGenerated }: BillFormProps) {
  // Client states
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  // Product states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productSearchTerm, setProductSearchTerm] = useState("");

  // Bill states
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState<string>("");
  const [items, setItems] = useState<
    Array<{ product: Product; quantity: number; price_at_time: number }>
  >([]);
  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null);

  // Debounced client search (API-based)
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (clientSearchTerm.trim().length > 0) {
        try {
          setLoadingClients(true);
          const results = await db.searchClients(clientSearchTerm);
          setSearchResults(results);
        } catch (err) {
          console.error("Error searching clients:", err);
          toast.error("Failed to search clients");
        } finally {
          setLoadingClients(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [clientSearchTerm]);

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) setQuantity(value);
  };

  const handleAddItem = () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }
    if (selectedProduct.stock < quantity) {
      toast.error(`Only ${selectedProduct.stock} items available`);
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        product: selectedProduct,
        quantity,
        price_at_time: selectedProduct.price,
      },
    ]);
    setSelectedProduct(null);
    setProductSearchTerm("");
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () =>
    items.reduce((total, item) => total + item.quantity * item.price_at_time, 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      toast.error("Please select a client");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    try {
      const total = calculateTotal();
      const discountValue = parseFloat(discount) || 0;

      for (const item of items) {
        const newStock = item.product.stock - item.quantity;
        if (newStock < 0) {
          toast.error(`Not enough stock for ${item.product.name}`);
          return;
        }
        await db.updateProduct(item.product.id, { stock: newStock });
      }

      const bill = await db.addBill({
        client_id: selectedClient.id,
        total,
        discount: discountValue,
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price_at_time: item.price_at_time,
        })),
      });

      setGeneratedBill(bill);
      if (onBillGenerated) onBillGenerated(bill);
      toast.success("Bill generated successfully");

      // Reset states
      setSelectedClient(null);
      setClientSearchTerm("");
      setSelectedProduct(null);
      setProductSearchTerm("");
      setQuantity(1);
      setDiscount("");
      setItems([]);
    } catch (error) {
      console.error("Error generating bill:", error);
      toast.error("Failed to generate bill");
    }
  };

  const formatPrice = (price: number) => `Rs. ${price.toFixed(2)}`;

  if (generatedBill) {
    return (
      <div className="space-y-4 p-4 flex flex-col items-center">
        <div className="shadow-sm">
          <Invoice bill={generatedBill} />
        </div>
        <div className="flex justify-between w-full max-w-[320px]">
          <button
            onClick={() => window.print()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Print Invoice
          </button>
          <button
            onClick={() => setGeneratedBill(null)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Create New Bill
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Search */}
      <div>
        <label className="text-sm font-medium text-gray-700">Select Client</label>
        <input
          type="text"
          placeholder="Search client..."
          value={clientSearchTerm}
          onChange={(e) => setClientSearchTerm(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {loadingClients && (
          <div className="text-gray-500 text-sm px-2 py-1">Searching...</div>
        )}
        {searchResults.length > 0 && (
          <div className="mt-2 max-h-40 overflow-y-auto border rounded-md bg-white">
            {searchResults.map((client) => (
              <div
                key={client.id}
                onClick={() => {
                  setSelectedClient(client);
                  setClientSearchTerm(`${client.name} - ${client.phone}`);
                  setSearchResults([]);
                }}
                className={`px-3 py-2 cursor-pointer hover:bg-blue-100 ${
                  selectedClient?.id === client.id ? "bg-blue-50" : ""
                }`}
              >
                {client.name} - {client.phone}
              </div>
            ))}
          </div>
        )}
      </div>
        {/* Discount */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Discount Amount (Rs)</label>
        <input
          type="text"
          pattern="\d*\.?\d{0,2}"
          value={discount}
          placeholder="Enter discount"
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
              setDiscount(value);
            }
          }}
          onBlur={() => {
            if (discount !== '') {
              const value = parseFloat(discount) || 0;
              setDiscount(value.toFixed(2));
            }
          }}
          className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      {/* Product Search */}
      <div>
        <label className="text-sm font-medium text-gray-700">Select Product</label>
        <input
          type="text"
          placeholder="Search product..."
          value={productSearchTerm}
          onChange={(e) => setProductSearchTerm(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <div className="mt-2 max-h-40 overflow-y-auto border rounded-md bg-white">
          {products
            .filter((p) =>
              `${p.name} ${p.price}`
                .toLowerCase()
                .includes(productSearchTerm.toLowerCase())
            )
            .map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product);
                  setProductSearchTerm(
                    `${product.name} - Rs. ${product.price}`
                  );
                }}
                className={`px-3 py-2 cursor-pointer hover:bg-blue-100 ${
                  selectedProduct?.id === product.id ? "bg-blue-50" : ""
                }`}
              >
                {product.name} - Rs. {product.price}
              </div>
            ))}
        </div>
      </div>

      {/* Quantity + Add */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleAddItem}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Item
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
        {items.length === 0 ? (
          <p className="text-gray-500">No items added yet</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {items.map((item, index) => (
              <li key={index} className="py-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{item.product.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} × {formatPrice(item.price_at_time)} ={" "}
                    {formatPrice(item.quantity * item.price_at_time)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Total */}
      <div className="bg-gray-50 p-4 rounded-lg text-right">
        <p>Subtotal: {formatPrice(calculateTotal())}</p>
        <p>Discount: {formatPrice(parseFloat(discount) || 0)}</p>
        <p className="text-lg font-bold">
          Total: {formatPrice(calculateTotal() - (parseFloat(discount) || 0))}
        </p>
        <button
          type="submit"
          className="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
        >
          Generate Bill
        </button>
      </div>
    </form>
  );
}
