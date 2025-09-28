import { useState, FormEvent } from 'react';
import type { Client } from '../types';
import { toast } from 'react-hot-toast';

interface ClientFormProps {
  onSubmit: (client: Omit<Client, 'id' | 'created_at'>) => Promise<void>;
}

export function ClientForm({ onSubmit }: ClientFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a client name');
      return;
    }

    if (!phone.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    if (!address.trim()) {
      toast.error('Please enter an address');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim()
      });

      toast.success('Client added successfully');

      // Reset form
      setName('');
      setPhone('');
      setAddress('');
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Failed to add client');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4 max-w-md">
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Customer Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            placeholder="Enter customer name"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => {
              let val = e.target.value.replace(/\D/g, ""); // remove non-digits
              if (!val.startsWith("03")) val.slice(0, 9); // enforce prefix
              if (val.length > 11) val = val.slice(0, 11); // limit to 11 digits
              setPhone(val);
            }}
            pattern="03[0-9]{9}"
            maxLength={11}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            placeholder="03XXXXXXXXX"
          />
          <small className="text-xs text-gray-500">Must start with "03" and be 11 digits</small>
        </div>


        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            placeholder="Enter address"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Customer
        </button>
      </div>
    </form>
  );
}