# Ali Electronics Billing Software

A modern billing management system built with React, TypeScript, TailwindCSS, Supabase (using MySQL), and Electron.

## About

Ali Electronics Billing Software is designed to help manage products, clients, and invoices efficiently. The application was originally built with Electron for desktop support, but the latest version is fully web-based for increased accessibility and ease of use.

## Tech Stack

- **Frontend:** React, TypeScript, TailwindCSS
- **Backend/Database:** Supabase (MySQL)
- **Packaging:** Originally Electron (desktop); latest version is web-based only

## Features

- Product management
- Client management
- Bill/invoice generation
- Printable invoices
- User-friendly & responsive UI built with TailwindCSS

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

- Open phpMyAdmin or use the MySQL command line.
- Import the SQL migration file located at `supabase/migrations/20250122105345_muddy_lab.sql` to set up the database structure.

### 3. Environment Variables

- Copy `.env.example` to `.env`:
  ```bash
  cp .env.example .env
  ```
- Update the values in `.env` with your Supabase and MySQL configuration.

### 4. Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

## Notes

- The Electron desktop version is no longer maintained; all new features and fixes target the web-based version.
- Make sure your MySQL instance is running and your Supabase project is properly configured before starting the app.

## License

This project is licensed under the MIT License.
