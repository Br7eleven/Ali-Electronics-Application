import React from 'react';
import { Printer } from 'lucide-react';
import type { Bill, Client, Product } from '../types';

interface BillPreviewProps {
  bill: Bill;
  client: Client;
  products: Product[];
}

export function BillPreview({ bill, client, products }: BillPreviewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md print:shadow-none">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ali Electronics</h1>
        <p className="text-gray-600">Invoice</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-lg font-semibold mb-2">Bill To:</h2>
          <p className="text-gray-700">{client.name}</p>
          <p className="text-gray-600">{client.address}</p>
          <p className="text-gray-600">{client.phone}</p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-semibold mb-2">Invoice Details:</h2>
          <p className="text-gray-700">Invoice #: {bill.id}</p>
          <p className="text-gray-700">Date: {formatDate(bill.date)}</p>
        </div>
      </div>

      <table className="min-w-full mb-8">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Item</th>
            <th className="text-right py-2">Quantity</th>
            <th className="text-right py-2">Price</th>
            <th className="text-right py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, index) => {
            const product = products.find(p => p.id === item.productId);
            return (
              <tr key={index} className="border-b">
                <td className="py-2">{product?.name}</td>
                <td className="text-right py-2">{item.quantity}</td>
                <td className="text-right py-2">₹{item.price}</td>
                <td className="text-right py-2">₹{item.price * item.quantity}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="text-right py-4 font-semibold">Total:</td>
            <td className="text-right py-4 font-semibold">₹{bill.total}</td>
          </tr>
        </tfoot>
      </table>

      <div className="text-center text-gray-600 text-sm mb-8">
        <p>Thank you for your business!</p>
      </div>

      <button
        onClick={handlePrint}
        className="print:hidden inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Printer className="mr-2 h-4 w-4" />
        Print Invoice
      </button>
    </div>
  );
}