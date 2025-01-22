/*
  # Initial Schema Setup for Ali Electronics

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `price` (numeric)
      - `stock` (integer)
      - `created_at` (timestamp)
      - `user_id` (uuid, foreign key to auth.users)

    - `clients`
      - `id` (uuid, primary key)
      - `name` (text)
      - `phone` (text)
      - `address` (text)
      - `created_at` (timestamp)
      - `user_id` (uuid, foreign key to auth.users)

    - `bills`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `date` (timestamp)
      - `total` (numeric)
      - `created_at` (timestamp)
      - `user_id` (uuid, foreign key to auth.users)

    - `bill_items`
      - `id` (uuid, primary key)
      - `bill_id` (uuid, foreign key to bills)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer)
      - `price` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own products"
  ON products
  USING (auth.uid() = user_id);

-- Clients table
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own clients"
  ON clients
  USING (auth.uid() = user_id);

-- Bills table
CREATE TABLE bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients NOT NULL,
  date timestamptz DEFAULT now(),
  total numeric NOT NULL DEFAULT 0 CHECK (total >= 0),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own bills"
  ON bills
  USING (auth.uid() = user_id);

-- Bill items table
CREATE TABLE bill_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id uuid REFERENCES bills NOT NULL,
  product_id uuid REFERENCES products NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their bill items through bills"
  ON bill_items
  USING (
    EXISTS (
      SELECT 1 FROM bills
      WHERE bills.id = bill_items.bill_id
      AND bills.user_id = auth.uid()
    )
  );