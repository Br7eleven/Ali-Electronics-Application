import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import type { Product, Client,  NewBill, NewBillItem } from '../types';

interface BillGeneratorProps {
  products: Product[];
  clients: Client[];
  onGenerateBill: (bill: NewBill) => void;
}

export function BillGenerator({ products, clients, onGenerateBill }: BillGeneratorProps) {
  const [selectedClient, setSelectedClient] = useState('');
  const [items, setItems] = useState<NewBillItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('1');

  const addItem = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (product) {
      setItems([
        ...items,
        {
          product_id: product.id,
          quantity: Number(quantity),
          price_at_time: product.price
        }
      ]);
      setSelectedProduct('');
      setQuantity('1');
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price_at_time * item.quantity, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    if (items.length === 0) return;

    const bill: NewBill = {
      client_id: selectedClient,
      total: calculateTotal(),
      discount: 0,
      items
    };

    onGenerateBill(bill);

    setSelectedClient('');
    setItems([]);
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800">Generate Bill</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Select Customer</label>
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a customer</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a product</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>{product.name} - ₹{product.price}</option>
            ))}
          </select>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addItem}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add
          </button>
        </div>

        <div className="border rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, index) => {
                const product = products.find(p => p.id === item.product_id);
                return (
                  <tr key={index}>
                    <td className="px-6 py-4">{product?.name}</td>
                    <td className="px-6 py-4">{item.quantity}</td>
                    <td className="px-6 py-4">₹{item.price_at_time}</td>
                    <td className="px-6 py-4">₹{item.price_at_time * item.quantity}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-xl font-semibold">
            Total: ₹{calculateTotal()}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!selectedClient || items.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate Bill
          </button>
        </div>
      </div>
    </div>
  );
}
