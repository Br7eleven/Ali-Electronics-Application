import { useState } from 'react';
import type { Product } from '../types';
import { db } from '../lib/db';
import { toast } from 'react-hot-toast';

interface ProductListProps {
  products: Product[];
  onProductUpdate: (updatedProduct: Product) => void;
}

export function ProductList({ products, onProductUpdate }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    stock: ''
  });

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toFixed(2);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.price.toString().includes(searchTerm) ||
    product.stock.toString().includes(searchTerm)
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString()
    });
  };

  const handleSave = async () => {
    if (!editingProduct) return;

    const priceValue = parseFloat(editForm.price);
    const stockValue = parseInt(editForm.stock);

    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (isNaN(stockValue) || stockValue < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    if (!editForm.name.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    try {
      const updatedProduct = await db.updateProduct(editingProduct.id, {
        name: editForm.name.trim(),
        price: priceValue,
        stock: stockValue
      });
      if (updatedProduct) {
        onProductUpdate(updatedProduct);
        setEditingProduct(null);
        toast.success('Product updated successfully');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setEditForm({
      name: '',
      price: '',
      stock: ''
    });
  };

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className=" mt-1 block pl-8 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200 border border-zinc-700">
          <thead className="bg-zinc-700 ">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-50 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-50 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-50 uppercase tracking-wider">
                Stock
              </th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-zinc-50 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-zinc-300">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 tracking-normal">
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingProduct?.id === product.id ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="block  rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingProduct?.id === product.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="block  rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">Rs. {formatPrice(product.price)}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingProduct?.id === product.id ? (
                    <input
                      type="number"
                      value={editForm.stock}
                      onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                      className="block  rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{product.stock}</div>
                  )}
                </td>
                <td className="px-8 flex-wrap text-center py-4 whitespace-nowrap  text-sm font-medium">
                  {editingProduct?.id === product.id ? (
                    <div className="space-x-2">
                      <button
                        onClick={handleSave}
                        className="px-3 py-1 bg-green-500 text-zinc-50 hover:bg-green-600  rounded-md"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1 bg-red-600 text-zinc-50 hover:bg-red-700  rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-3 py-1 bg-blue-500 text-zinc-50 hover:bg-blue-600  rounded-md"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No products found
          </div>
        )}
      </div>
    </div>
  );
}
