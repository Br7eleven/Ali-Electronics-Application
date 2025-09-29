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
      day: 'numeric',
    });

  const total = bill.total;
  const discount = bill.discount;

  return (
    <div className="bg-white p-8 rounded shadow print-area w-full max-w-[800px] mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Ali Electronics</h1>
        <p className="text-sm">
          Asghar Market near Shah City Mall, Puniyal Road, Gilgit
        </p>
        <p className="text-sm">0310-909340-9 / 0355-450462-2</p>
      </div>

      {/* Bill Info */}
      <div className="flex justify-between text-sm mb-6">
        <div>
          <p>
            <span className="font-semibold">Bill To:</span>{" "}
            {bill.client?.name || "Unknown"}
          </p>
        </div>
        <div className="text-right">
          <p>
            <span className="font-semibold">Invoice #:</span>{" "}
            {bill.id.slice(0, 8)}
          </p>
          <p>
            <span className="font-semibold">Date:</span>{" "}
            {formatDate(bill.created_at)}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-sm border border-gray-300 border-collapse mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-2 border border-gray-300">Item</th>
            <th className="text-center p-2 border border-gray-300">Qty</th>
            <th className="text-right p-2 border border-gray-300">Price</th>
            <th className="text-right p-2 border border-gray-300">Total</th>
          </tr>
        </thead>
        <tbody>
          {bill.bill_items?.map((item, i) => {
            const lineTotal = item.price_at_time * item.quantity;
            return (
              <tr key={i} className="border-t border-gray-200">
                <td className="p-2 border border-gray-300">
                  {item.product?.name}
                </td>
                <td className="text-center p-2 border border-gray-300">
                  {item.quantity}
                </td>
                <td className="text-right p-2 border border-gray-300">
                  {formatPrice(item.price_at_time)}
                </td>
                <td className="text-right p-2 border border-gray-300">
                  {formatPrice(lineTotal)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary */}
      <div className="text-sm w-full flex justify-end">
        <div className="w-1/3">
          <div className="flex justify-between py-1">
            <span>Subtotal:</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Discount:</span>
            <span>{formatPrice(discount)}</span>
          </div>
          <div className="flex justify-between py-1 font-bold border-t border-gray-300">
            <span>Total:</span>
            <span>{formatPrice(total - discount)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs mt-12">
        <p>Thank you for shopping!</p>
        <p>Contact: 0346-540706-8</p>
        <p>Developed by BR7 Technologies & Co.</p>
      </div>

      {/* Print Styles */}
      <style>
  {`
    @media print {
      body * {
        visibility: hidden;
      }
      .print-area, .print-area * {
        visibility: visible;
      }
      .print-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 210mm !important;     /* A4 width */
        min-height: 297mm !important; /* A4 height */
        margin: 0 auto !important;
        padding: 20mm !important;
        background: white !important;
        box-shadow: none !important;
        font-size: 14px !important;
      }
      .print-area * {
        color: black !important;
      }
      @page {
        size: A4;
        margin: 15mm;
      }
    }
  `}
</style>
    </div>
  );
}
