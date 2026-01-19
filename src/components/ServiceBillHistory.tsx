import 'react-datepicker/dist/react-datepicker.css';

import { useState, useMemo } from 'react';
import type { ServiceBill } from '../types';
import { ServiceInvoice } from './ServiceInvoice';
import DatePicker from 'react-datepicker';

interface ServiceBillHistoryProps {
  serviceBills: ServiceBill[];
  searchTerm: string;
  onEditBill?: (bill: ServiceBill) => void;
}

export function ServiceBillHistory({ serviceBills, searchTerm, onEditBill }: ServiceBillHistoryProps) {
  const [selectedServiceBill, setSelectedServiceBill] = useState<ServiceBill | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const filteredServiceBills = useMemo(() => {
    const isSameDay = (date1: Date, date2: Date) =>
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();

    const filterDate = selectedDate || new Date();

    return serviceBills
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .filter(bill => {
        const matchesSearch =
          bill.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bill.id.toString().toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) {
          return false;
        }

        const billDate = new Date(bill.created_at);
        return isSameDay(billDate, filterDate);
      });
  }, [serviceBills, searchTerm, selectedDate]);

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
    setSelectedServiceBill(null);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  return (
    <div className="space-y-4">
      {/* Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <label htmlFor="date-picker" className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Filter by Date:
          </label>
          <DatePicker
            id="date-picker"
            selected={selectedDate}
            onChange={(date: Date | null) => setSelectedDate(date)}
            isClearable
            placeholderText="Select Date"
            className="w-full sm:w-40 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            dateFormat="dd/MM/yyyy"
          />
        </div>
      </div>

      {/* Service Bills Table */}
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
                  Discount(Rs.)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-50 uppercase tracking-wider">
                  Total Amount(Rs.)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-50 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServiceBills.length > 0 ? (
                filteredServiceBills.map((bill) => (
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
                      {bill.discount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(Number(bill.total) - Number(bill.discount || 0))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedServiceBill(bill)}
                        className="text-blue-600 hover:text-blue-900 font-semibold"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onEditBill?.(bill)}
                        className="text-green-600 hover:text-green-900 font-semibold"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No service bills found for the selected criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedServiceBill && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleOverlayClick}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Service Invoice</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <ServiceInvoice serviceBill={selectedServiceBill} />

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
              >
                Print Invoice
              </button>
              <button
                onClick={handleCloseModal}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
