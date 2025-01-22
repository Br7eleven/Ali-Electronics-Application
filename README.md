# Ali Electronics Billing Software

A billing management system built with React and MySQL.

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create MySQL database and tables:
- Open phpMyAdmin or MySQL command line
- Import the SQL file from `supabase/migrations/20250122105345_muddy_lab.sql`

3. Configure environment variables:
- Copy `.env.example` to `.env`
- Update the MySQL connection details in `.env`

4. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

## Features
- Product management
- Client management
- Bill generation
- Printable invoices