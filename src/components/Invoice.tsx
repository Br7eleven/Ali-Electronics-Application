import type { Bill } from '../types';

interface InvoiceProps {
  bill: Bill;
}

export function Invoice({ bill }: InvoiceProps) {
  const formatPrice = (price: number) => `Rs. ${price.toFixed(2)}`;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

  const total = bill.total;
  const discount = bill.discount;

  return (
    <div className="bg-white p-4 rounded shadow print-area w-[320px]">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold">Ali Electronics</h1>
        <p className="text-sm">Asghar market near Shah City Mall, Puniyal road, Gilgit</p>
        <p className="text-sm">0310-909340-9 / 0355-450462-2</p>
      </div>

      {/* Bill Info */}
      <div className="mb-4">
        <p className="text-sm font-semibold">Bill To: <span className="font-normal">{bill.client?.name || "Unknown"}</span></p>
        <p className="text-sm"><span className="font-semibold">Invoice #:</span> {bill.id.slice(0, 8)}</p>
        <p className="text-sm"><span className="font-semibold">Date:</span> {formatDate(bill.created_at)}</p>
      </div>

      {/* Items Table */}
      <table className="w-full text-sm border-collapse mb-4">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="text-left py-1">Item</th>
            <th className="text-center py-1">Qty</th>
            <th className="text-right py-1">Price</th>
            {/* <th className="text-right py-1">Total</th> */}
          </tr>
        </thead>
        <tbody>
  {bill.bill_items?.map((item, i) => (
    <tr key={i} className="border-b border-gray-200">
      <td className="py-1">{item.product?.name}</td>
      <td className="text-center py-1">{item.quantity}</td>
      <td className="text-right py-1">{formatPrice(item.price_at_time)}</td>
      {/* <td className="text-right py-1">{formatPrice((item.product?.price || 0) * item.quantity)}</td> */}
    </tr>
  ))}
</tbody>
      </table>

      {/* Summary */}
      <div className="text-sm">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount:</span>
          <span>{formatPrice(discount)}</span>
        </div>
        <div className="flex justify-between font-bold border-t border-gray-300 pt-1">
          <span>Total:</span>
          <span>{formatPrice(total - discount)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs mt-4">
        <p>Thank you for shopping!</p>
        <p>Contact: 0346-540706-8</p>
        <p>Developed by BR7 Technologies & Co.</p>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: relative; left: 0; top: 0; width: 320px; }
            @page { size: auto; margin: 10mm; }
          }
        `}
      </style>
    </div>
  );
}
