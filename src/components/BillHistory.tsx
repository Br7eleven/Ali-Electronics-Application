import { useState } from 'react';
import type { Bill } from '../types';
import { Invoice } from './Invoice';

interface BillHistoryProps {
  bills: Bill[];
  searchTerm: string;
}

export function BillHistory({ bills, searchTerm }: BillHistoryProps) {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const filteredBills = bills.filter(bill => 
  bill.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  bill.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
);


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return `Rs. ${price.toFixed(2)}`;
  };

  const handleCloseModal = () => {
    setSelectedBill(null);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  return (
    <div className="space-y-4">
  {/* Bills List */}
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-zinc-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-50 uppercase tracking-wider">
              Bill ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-50 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-50 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-50 uppercase tracking-wider">
              Discount($)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-50 uppercase tracking-wider">
              Total Amount($)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-50 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredBills.map((bill) => (
            <tr key={bill.id} className="hover:bg-gray-50 tracking-normal">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {bill.id.slice(0, 8)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {bill.client?.name || "Unknown Client"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(bill.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {bill.discount }
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatPrice(Number(bill.total) - Number(bill.discount || 0))}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <button
                  onClick={() => setSelectedBill(bill)}
                  className="text-zinc-50 hover:bg-blue-400 bg-blue-500 py-1 px-1 rounded-md"
                >
                  View Invoice
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

  {/* Invoice Modal */}
  {selectedBill && (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      onClick={handleOverlayClick}
    >
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full m-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={handleCloseModal}
              className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleOverlayClick}
          >
            <div
              className="bg-white rounded shadow p-2 max-w-[340px] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Invoice bill={selectedBill} />
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  onClick={() => window.print()}
                  className="py-1 px-3 text-sm font-medium rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Print Invoice
                </button>
                <button
                  onClick={handleCloseModal}
                  className="py-1 px-3 text-sm font-medium rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}
</div>

  );
}
