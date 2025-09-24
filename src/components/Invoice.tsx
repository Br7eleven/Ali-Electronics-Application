import type { Bill } from '../types';

interface InvoiceProps {
  bill: Bill;
  
}

export function Invoice({ bill }: InvoiceProps) {
  const formatPrice = (price: number) => `Rs. ${price.toFixed(2)}`;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const total = bill.total; // fixed from total_amount
  const discount = bill.discount;

  return (
    <div className="bg-white p-8 rounded-lg shadow-md print-area">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Ali Electronics</h1>
        <p className="text-gray-600">Address: Asghar market near Shah City Mall punyal road Gilgit.</p>
        <p className="text-gray-600">Phone: 0310-909340-9 / 0355-450462-2</p>
      </div>

      {/* Invoice Info */}
      <div className="flex justify-between mb-8">
        <div className="text-md font-sm mb-2">
            <h2 className="text-zinc-700">
              <span className="font-semibold">Bill To:</span> <span className="font-normal">{bill.client?.name}</span>
            </h2>
          </div>
        <div className="text-right">
          <p className="text-gray-700">
            <span className="font-semibold">Invoice #:</span> {bill.id.slice(0, 8)}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Date:</span> {formatDate(bill.created_at)}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-2">Item</th>
            <th className="text-right py-2">Quantity</th>
            <th className="text-right py-2">Price</th>
            <th className="text-right py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {bill.items?.map((item, index) => (
            <tr key={index} className="border-b border-gray-100">
              <td className="py-2">{item.product_name}</td>
              <td className="text-right py-2">{item.quantity}</td>
              <td className="text-right py-2">{formatPrice(item.price_at_time)}</td>
              <td className="text-right py-2">{formatPrice(item.price_at_time * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-gray-200">
          <tr>
            <td colSpan={3} className="py-2 text-right text-gray-600">
              Subtotal:
            </td>
            <td className="py-2 text-right text-gray-600">{formatPrice(total)}</td>
          </tr>
          <tr>
            <td colSpan={3} className="py-2 text-right text-gray-600">
              Discount:
            </td>
            <td className="py-2 text-right text-gray-600">{formatPrice(discount)}</td>
          </tr>
          <tr>
            <td colSpan={3} className="py-2 text-right font-bold">Total:</td>
            <td className="py-2 text-right font-bold">{formatPrice(total - discount)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Footer */}
      <div className="text-center text-gray-600 text-sm mt-8">
        <p>Thank you for Shopping!</p>
        <p>For any queries, please contact us at: 0346-540706-8</p>
        <p>Developed By Balaj Hussain</p>
      </div>

      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: relative; left: 0; top: 0; width: 100%; }
            @page { margin: auto; }
          }
        `}
      </style>
    </div>
  );
}
