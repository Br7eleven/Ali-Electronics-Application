import 'react-datepicker/dist/react-datepicker.css';

import { useState, useMemo } from 'react';
import type { Bill } from '../types';
import { Invoice } from './Invoice';
import DatePicker from 'react-datepicker';

interface BillHistoryProps {
  bills: Bill[];
  searchTerm: string;
}

export function BillHistory({ bills, searchTerm }: BillHistoryProps) {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  
  // DEFAULT CHANGE: Ab selectedDate state ki shuruaat (initial value) 'aaj ki date' hogi.
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); 
  // Agar aap chahte hain ki Date Picker shuru mein khali ho, toh yahan new Date() ki jagah null rehne dein, 
  // lekin filtering logic mein 'aaj ki date' use karein. (Neeche wala tareeqa zyada behtar hai)

  const filteredBills = useMemo(() => {
    // Date comparison ke liye helper function: Sirf date (day, month, year) check karega
    const isSameDay = (date1: Date, date2: Date) => 
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
    
    // Woh date jis par filter karna hai. Agar selectedDate null hai, toh 'aaj ki date' ko filter date banao.
    const filterDate = selectedDate || new Date(); 

    return bills
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .filter(bill => {
        // 1. Search Term filtering
        const matchesSearch = 
          bill.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bill.id.toString().toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) {
          return false;
        }

        // 2. Date filtering
        // Yahan ab selectedDate ki bajaye 'filterDate' use ho raha hai
        const billDate = new Date(bill.created_at);
        return isSameDay(billDate, filterDate); 
        // Ab yeh hamesha filterDate (ya toh selected date, ya aaj ki date) ke bills hi return karega.
      });
  }, [bills, searchTerm, selectedDate]); 
  
  // ... (formatDate, formatPrice, handleCloseModal, handleOverlayClick functions wahi rahenge)
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
      {/* Search Bar aur Date Picker Container */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
        
        {/* Date Selection Control */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <label htmlFor="date-picker" className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Filter by Date:
          </label>
          <DatePicker
            id="date-picker"
            selected={selectedDate}
            onChange={(date: Date | null) => setSelectedDate(date)}
            // Ab isClearable ki bajaye, Clear button ki functionality ko custom karna behtar hoga
            // ya phir agar aap chahte hain ki user date clear kare toh saare bills dikhein, 
            // toh default state ko null rakh kar filtering logic adjust karna hoga. 
            // Lekin aapki latest requirement ke mutabiq, humne new Date() set kiya hai.
            isClearable 
            placeholderText="Select Date"
            className="w-full sm:w-40 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            dateFormat="dd/MM/yyyy"
          />
        </div>
        
      </div>

      {/* --- */}

      {/* Bills List (Baaki Table aur Modal ka hissa wahi rahega) */}
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
              {filteredBills.length > 0 ? (
                filteredBills.map((bill) => (
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
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No bills generated on selected date  😔
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- */}

      {/* Invoice Modal (Wahi rahega) */}
      {selectedBill && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
          onClick={handleOverlayClick}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Content */}
            <div className=""> 
              <Invoice bill={selectedBill} />
            </div>

            {/* Close Button at top right */}
            <button
              onClick={handleCloseModal}
              className="absolute top-0 right-0 mt-2 mr-2 bg-white rounded-full p-1 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Action Buttons */}
            <div className="border-t p-2 flex justify-end space-x-2">
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
      )}
    </div>
  );
}