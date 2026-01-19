import { useState, FormEvent, ChangeEvent } from 'react';
import type { Service } from '../types';
import { toast } from 'react-hot-toast';

interface ServiceFormProps {
  onSubmit: (service: Omit<Service, 'id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
}

export function ServiceForm({ onSubmit, onCancel }: ServiceFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a service name');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        price: priceValue,
      });

      toast.success('Service added successfully');

      // Reset form
      setName('');
      setPrice('');
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Failed to add service');
    }
  };

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPrice(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Service Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          placeholder="Enter service name"
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          placeholder="Enter price"
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
          Add Service
        </button>
      </div>
    </form>
  );
}
