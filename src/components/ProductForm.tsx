import { useState, FormEvent, ChangeEvent } from 'react';
import type { Product } from '../types';
import { toast } from 'react-hot-toast';

interface ProductFormProps {
  onSubmit: (product: Omit<Product, 'id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ onSubmit, onCancel }: ProductFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const stockValue = parseInt(stock);
    if (isNaN(stockValue) || stockValue < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        price: priceValue,
        stock: stockValue
      });
      
      toast.success('Product added successfully');
      
      // Reset form
      setName('');
      setPrice('');
      setStock('');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPrice(value);
    }
  };

  const handleStockChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setStock(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Product Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-flex rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter product name"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price (Rs.)
        </label>
        <input
          type="text"
          id="price"
          value={price}
          onChange={handlePriceChange}
          className="mt-1 block w-flex rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter price"
        />
      </div>

      <div>
        <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
          Stock
        </label>
        <input
          type="text"
          id="stock"
          value={stock}
          onChange={handleStockChange}
          className="mt-1 block w-flex rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter stock quantity"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Product
        </button>
      </div>
    </form>
  );
}