import { useState } from "react";
import { db } from "../lib/db";
import type { Client } from "../types";

interface ClientSearchProps {
  onSelect: (client: Client) => void;
}

export function ClientSearch({ onSelect }: ClientSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await db.searchClients(text);
      setResults(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search client..."
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />

      {loading && <div className="text-sm text-gray-500">Searching...</div>}

      {results.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded-md shadow">
          {results.map((client) => (
            <li
              key={client.id}
              onClick={() => {
                onSelect(client);
                setResults([]);
                setQuery(`${client.name} - ${client.phone}`);
              }}
              className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
            >
              {client.name} - {client.phone}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
