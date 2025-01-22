import React, { useState, useEffect } from 'react';
import { CircuitBoard } from 'lucide-react';
import { ProductForm } from './components/ProductForm';
import { ClientForm } from './components/ClientForm';
import { BillGenerator } from './components/BillGenerator';
import { BillPreview } from './components/BillPreview';
import type { Product, Client, Bill } from './types';
import pool from './lib/db';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'clients' | 'billing'>('products');
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Test database connection
        await pool.query('SELECT 1');
        setDbError(null);
      } catch (error) {
        console.error('Database connection error:', error);
        setDbError('Unable to connect to database. Please check your database configuration.');
      }
    };

    loadInitialData();
  }, []);

  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const [result] = await pool.execute(
        'INSERT INTO products (id, name, price, stock) VALUES (UUID(), ?, ?, ?)',
        [productData.name, productData.price, productData.stock]
      );
      const [rows] = await pool.execute('SELECT * FROM products WHERE id = LAST_INSERT_ID()');
      const newProduct = rows[0];
      setProducts([...products, newProduct]);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleUpdateProduct = async (id: string, productData: Omit<Product, 'id'>) => {
    try {
      await pool.execute(
        'UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?',
        [productData.name, productData.price, productData.stock, id]
      );
      setProducts(products.map(p => p.id === id ? { ...productData, id } : p));
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await pool.execute('DELETE FROM products WHERE id = ?', [id]);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleAddClient = async (clientData: Omit<Client, 'id'>) => {
    try {
      const [result] = await pool.execute(
        'INSERT INTO clients (id, name, phone, address) VALUES (UUID(), ?, ?, ?)',
        [clientData.name, clientData.phone, clientData.address]
      );
      const [rows] = await pool.execute('SELECT * FROM clients WHERE id = LAST_INSERT_ID()');
      const newClient = rows[0];
      setClients([...clients, newClient]);
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const handleUpdateClient = async (id: string, clientData: Omit<Client, 'id'>) => {
    try {
      await pool.execute(
        'UPDATE clients SET name = ?, phone = ?, address = ? WHERE id = ?',
        [clientData.name, clientData.phone, clientData.address, id]
      );
      setClients(clients.map(c => c.id === id ? { ...clientData, id } : c));
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await pool.execute('DELETE FROM clients WHERE id = ?', [id]);
      setClients(clients.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const handleGenerateBill = async (billData: Omit<Bill, 'id'>) => {
    try {
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        const [billResult] = await connection.execute(
          'INSERT INTO bills (id, client_id, date, total) VALUES (UUID(), ?, NOW(), ?)',
          [billData.clientId, billData.total]
        );
        const [billRows] = await connection.execute('SELECT * FROM bills WHERE id = LAST_INSERT_ID()');
        const newBill = billRows[0];

        for (const item of billData.items) {
          await connection.execute(
            'INSERT INTO bill_items (id, bill_id, product_id, quantity, price) VALUES (UUID(), ?, ?, ?, ?)',
            [newBill.id, item.productId, item.quantity, item.price]
          );

          await connection.execute(
            'UPDATE products SET stock = stock - ? WHERE id = ?',
            [item.quantity, item.productId]
          );
        }

        await connection.commit();
        setBills([...bills, newBill]);
        setSelectedBill(newBill);

        const [updatedProducts] = await pool.execute('SELECT * FROM products');
        setProducts(updatedProducts);
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error generating bill:', error);
    }
  };

  if (dbError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <CircuitBoard className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">Database Connection Error</h1>
          <p className="text-gray-600 text-center mb-6">{dbError}</p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Please make sure:
                  <ul className="list-disc ml-5 mt-2">
                    <li>MySQL is installed and running</li>
                    <li>Database credentials in .env are correct</li>
                    <li>The database 'ali_electronics' exists</li>
                    <li>Required tables are created</li>
                  </ul>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CircuitBoard className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Ali Electronics</h1>
            </div>
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'products'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'clients'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Clients
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'billing'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Billing
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6">
          {activeTab === 'products' && (
            <ProductForm
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              products={products}
            />
          )}

          {activeTab === 'clients' && (
            <ClientForm
              onAddClient={handleAddClient}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
              clients={clients}
            />
          )}

          {activeTab === 'billing' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BillGenerator
                products={products}
                clients={clients}
                onGenerateBill={handleGenerateBill}
              />
              {selectedBill && (
                <BillPreview
                  bill={selectedBill}
                  client={clients.find(c => c.id === selectedBill.clientId)!}
                  products={products}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;