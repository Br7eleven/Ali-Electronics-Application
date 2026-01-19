import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import type { Service, Client, ServiceBill } from "../types";
import { toast } from "react-hot-toast";
import { db } from "../lib/db";
import { ServiceInvoice } from "./ServiceInvoice";

interface ServiceBillFormProps {
  services: Service[];
  onServiceBillGenerated?: (serviceBill: ServiceBill) => void;
  editingBill?: ServiceBill | null;
  onEditCancel?: () => void;
}

export function ServiceBillForm({ services, onServiceBillGenerated, editingBill, onEditCancel }: ServiceBillFormProps) {
  // Client states
  const [selectedClient, setSelectedClient] = useState<Client | null>(editingBill?.client || null);
  const [clientSearchTerm, setClientSearchTerm] = useState(editingBill?.client?.name || "");
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  // Service states
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");

  // Bill states
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState<string>(editingBill?.discount?.toString() || "");
  const [items, setItems] = useState<
    Array<{ service: Service; quantity: number; price_at_time: number }>
  >(
    editingBill?.service_items?.map(item => ({
      service: item.service || { id: item.service_id, name: item.service_name || "", price: item.price_at_time, created_at: new Date().toISOString() },
      quantity: item.quantity,
      price_at_time: item.price_at_time,
    })) || []
  );
  const [generatedServiceBill, setGeneratedServiceBill] = useState<ServiceBill | null>(null);

  // Debounced client search
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (clientSearchTerm.trim().length > 0) {
        try {
          setLoadingClients(true);
          const results = await db.searchClients(clientSearchTerm);
          setSearchResults(results);
        } catch (err) {
          console.error("Error searching clients:", err);
          toast.error("Failed to search clients");
        } finally {
          setLoadingClients(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [clientSearchTerm]);

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) setQuantity(value);
  };

  const handleAddItem = () => {
    if (!selectedService) {
      toast.error("Please select a service");
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        service: selectedService,
        quantity,
        price_at_time: selectedService.price,
      },
    ]);
    setSelectedService(null);
    setServiceSearchTerm("");
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () =>
    items.reduce((total, item) => total + item.quantity * item.price_at_time, 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      toast.error("Please select a client");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one service");
      return;
    }

    try {
      const total = calculateTotal();
      const discountValue = parseFloat(discount) || 0;

      if (editingBill) {
        // Update existing bill
        await db.updateServiceBill(editingBill.id, {
          total,
          discount: discountValue,
        });

        // Delete old service items
        for (const item of editingBill.service_items || []) {
          await db.deleteServiceItem(item.id);
        }

        // Add new service items
        const serviceItems = items.map((item) => ({
          service_bill_id: editingBill.id,
          service_id: item.service.id,
          quantity: item.quantity,
          price_at_time: item.price_at_time,
        }));

        for (const item of serviceItems) {
          await db.addServiceItem(item);
        }

        toast.success("Service bill updated successfully");
        if (onServiceBillGenerated) onServiceBillGenerated(editingBill);
        if (onEditCancel) onEditCancel();
      } else {
        // Create new bill
        const serviceBill = await db.addServiceBill({
          client_id: selectedClient.id,
          total,
          discount: discountValue,
          items: items.map((item) => ({
            service_id: item.service.id,
            quantity: item.quantity,
            price_at_time: item.price_at_time,
          })),
        });

        setGeneratedServiceBill(serviceBill);
        if (onServiceBillGenerated) onServiceBillGenerated(serviceBill);
        toast.success("Service bill generated successfully");

        // Reset states
        setSelectedClient(null);
        setClientSearchTerm("");
        setSelectedService(null);
        setServiceSearchTerm("");
        setQuantity(1);
        setDiscount("");
        setItems([]);
      }
    } catch (error) {
      console.error("Error handling service bill:", error);
      toast.error("Failed to process service bill");
    }
  };

  const formatPrice = (price: number) => `Rs. ${price.toFixed(2)}`;

  if (generatedServiceBill && !editingBill) {
    return (
      <div className="space-y-4 p-4 flex flex-col items-center">
        <div className="shadow-sm">
          <ServiceInvoice serviceBill={generatedServiceBill} />
        </div>
        <div className="flex justify-between w-full max-w-[320px]">
          <button
            onClick={() => window.print()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Print Invoice
          </button>
          <button
            onClick={() => setGeneratedServiceBill(null)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Create New Bill
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Title */}
      {editingBill && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900">Editing Service Bill: {editingBill.id.slice(0, 8)}</h2>
          <p className="text-sm text-blue-700">Customer: {editingBill.client?.name}</p>
        </div>
      )}

      {/* Client Search */}
      <div>
        <label className="text-sm font-medium text-gray-700">Select Customer</label>
        <input
          type="text"
          placeholder="Search customer..."
          value={clientSearchTerm}
          disabled={!!editingBill}

          onChange={(e) => setClientSearchTerm(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {loadingClients && (
          <div className="text-gray-500 text-sm px-2 py-1">Searching...</div>
        )}
        {searchResults.length > 0 && (
          <div className="mt-2 max-h-40 overflow-y-auto border rounded-md bg-white">
            {searchResults.map((client) => (
              <div
                key={client.id}
                onClick={() => {
                  setSelectedClient(client);
                  setClientSearchTerm(`${client.name} - ${client.phone}`);
                  setSearchResults([]);
                }}
                className={`px-3 py-2 cursor-pointer hover:bg-blue-100 ${
                  selectedClient?.id === client.id ? "bg-blue-50" : ""
                }`}
              >
                {client.name} - {client.phone}
              </div>
            ))}
          </div>
        )}
        {selectedClient && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800">
              Selected: {selectedClient.name} ({selectedClient.phone})
            </p>
          </div>
        )}
      </div>

      {/* Service Selection */}
      <div>
        <label className="text-sm font-medium text-gray-700">Select Service</label>
        <input
          type="text"
          placeholder="Search services..."
          value={serviceSearchTerm}
          onChange={(e) => setServiceSearchTerm(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {services.filter(s =>
          s.name.toLowerCase().includes(serviceSearchTerm.toLowerCase())
        ).length > 0 && (
          <div className="mt-2 max-h-40 overflow-y-auto border rounded-md bg-white">
            {services
              .filter(s =>
                s.name.toLowerCase().includes(serviceSearchTerm.toLowerCase())
              )
              .map((service) => (
                <div
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service);
                    setServiceSearchTerm(service.name);
                  }}
                  className={`px-3 py-2 cursor-pointer hover:bg-blue-100 ${
                    selectedService?.id === service.id ? "bg-blue-50" : ""
                  }`}
                >
                  {service.name} - {formatPrice(service.price)}
                </div>
              ))}
          </div>
        )}
        {selectedService && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800">
              Selected: {selectedService.name} ({formatPrice(selectedService.price)})
            </p>
          </div>
        )}
      </div>

      {/* Quantity */}
      <div>
        <label className="text-sm font-medium text-gray-700">Quantity</label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={handleQuantityChange}
          className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Add Item Button */}
      <button
        type="button"
        onClick={handleAddItem}
        className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Add Service to Bill
      </button>

      {/* Items Table */}
      {items.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium">Service</th>
                  <th className="px-4 py-2 text-center text-sm font-medium">Qty</th>
                  <th className="px-4 py-2 text-right text-sm font-medium">Price</th>
                  <th className="px-4 py-2 text-right text-sm font-medium">Total</th>
                  <th className="px-4 py-2 text-center text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2 text-sm">{item.service.name}</td>
                    <td className="px-4 py-2 text-center text-sm">{item.quantity}</td>
                    <td className="px-4 py-2 text-right text-sm">{formatPrice(item.price_at_time)}</td>
                    <td className="px-4 py-2 text-right text-sm">
                      {formatPrice(item.quantity * item.price_at_time)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Discount */}
      <div>
        <label className="text-sm font-medium text-gray-700">Discount (Rs.)</label>
        <input
          type="number"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="0"
        />
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>{formatPrice(calculateTotal())}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Discount:</span>
          <span>{formatPrice(parseFloat(discount) || 0)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
          <span>Total:</span>
          <span>{formatPrice(calculateTotal() - (parseFloat(discount) || 0))}</span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
        >
          {editingBill ? "Save Changes" : "Generate Service Bill"}
        </button>
        {editingBill && (
          <button
            type="button"
            onClick={onEditCancel}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 font-medium"
          >
            Cancel Edit
          </button>
        )}
      </div>
    </form>
  );
}
