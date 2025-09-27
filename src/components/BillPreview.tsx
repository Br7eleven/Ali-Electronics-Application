import type { Bill } from '../types';

interface BillPreviewProps {
  bill: Bill;
}

export function BillPreview({ bill }: BillPreviewProps) {
  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toFixed(2);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-medium text-gray-900">
            Bill #{bill.id.slice(0, 8)}
          </h4>
          <p className="text-sm text-gray-500">
            Client: {bill.client_name}
          </p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-lg font-medium text-gray-900">
            Subtotal: ${formatPrice(bill.total)}
          </p>
          {bill.discount > 0 && (
            <p className="text-sm text-red-600">
              Discount: -${formatPrice(bill.discount)}
            </p>
          )}
          <p className="text-lg font-bold text-green-600">
            Final Amount: ${formatPrice(bill.total - bill.discount)}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(bill.created_at || '').toLocaleDateString()}
          </p>
        </div>
      </div>
      
    </div>
  );
}