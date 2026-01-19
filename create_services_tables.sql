-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create service_bills table
CREATE TABLE IF NOT EXISTS service_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  total DECIMAL(12, 2) NOT NULL,
  discount DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create service_items table
CREATE TABLE IF NOT EXISTS service_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_bill_id UUID NOT NULL REFERENCES service_bills(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_time DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_service_bills_client_id ON service_bills(client_id);
CREATE INDEX IF NOT EXISTS idx_service_bills_created_at ON service_bills(created_at);
CREATE INDEX IF NOT EXISTS idx_service_items_service_bill_id ON service_items(service_bill_id);
CREATE INDEX IF NOT EXISTS idx_service_items_service_id ON service_items(service_id);

-- Enable RLS (Row Level Security) - Optional but recommended
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (Allow all operations for now - adjust based on your auth needs)
CREATE POLICY "Enable all for authenticated users" ON services
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON service_bills
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON service_items
  FOR ALL USING (true) WITH CHECK (true);
