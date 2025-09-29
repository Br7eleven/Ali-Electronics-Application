import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { db } from "../lib/db";
import type { Client, Payment, Bill } from "../types";

type Row = {
  bill: Bill;
  payment?: Payment | null;
};

export function Payments() {
  const [clients, setClients] = useState<Client[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [searchClient, setSearchClient] = useState<string>("");
  const [searchInvoice, setSearchInvoice] = useState<string>("");
  const [searchDate, setSearchDate] = useState<string>("");

  // editing state
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  const [editingPaid, setEditingPaid] = useState<number>(0);
  const [editingComment, setEditingComment] = useState<string>("");
  const [loadingRowId, setLoadingRowId] = useState<string | null>(null);

  useEffect(() => {
    db.getClients()
      .then(setClients)
      .catch(() => toast.error("Failed to load clients"));
  }, []);

  useEffect(() => {
    if (!selectedClient) {
      setRows([]);
      return;
    }
    loadRowsForClient(selectedClient);
  }, [selectedClient, searchInvoice, searchDate]);

  async function loadRowsForClient(clientId: string) {
    try {
      let bills: any[] = await db.getBillsWithPayments(clientId);

      // Apply invoice filter
      if (searchInvoice) {
        bills = bills.filter((bill: any) =>
          (bill.bill_id ?? bill.id.slice(0, 8))
            .toLowerCase()
            .includes(searchInvoice.toLowerCase())
        );
      }

      // Apply date filter
      if (searchDate) {
        bills = bills.filter((bill: any) =>
          bill.created_at?.slice(0, 10) === searchDate
        );
      }

      const mapped: Row[] = bills.map((b) => {
        const payment =
          Array.isArray(b.payments) && b.payments.length > 0
            ? b.payments[0]
            : b.payment || null;
        return { bill: b, payment };
      });
      setRows(mapped);
    } catch (err) {
      toast.error("Failed to load bills and payments");
      setRows([]);
    }
  }

  function openEdit(row: Row) {
    setEditingBillId(String(row.bill.id));
    setEditingPaid(Number(row.payment?.paid ?? 0));
    setEditingComment(row.payment?.comment ?? "");
  }

  function cancelEdit() {
    setEditingBillId(null);
    setEditingPaid(0);
    setEditingComment("");
  }

  async function saveRow(row: Row) {
    if (!selectedClient) return;
    const billId = row.bill.id;
    const total = Number(row.bill.total ?? 0);
    const paid = Number(editingPaid ?? 0);
    const comment = editingComment ?? "";

    setLoadingRowId(String(billId));
    try {
      if (row.payment && row.payment.id) {
        await db.updatePayment(row.payment.id, { paid, comment });
        toast.success("Payment updated");
      } else {
        await db.addPayment({
          client_id: selectedClient,
          bill_id: billId,
          total,
          paid,
          comment,
        });
        toast.success("Payment created");
      }
      await loadRowsForClient(selectedClient);
    } catch (err: any) {
      toast.error(err?.message ?? "Save failed");
    } finally {
      setLoadingRowId(null);
      cancelEdit();
    }
  }

  async function handleDeletePayment(paymentId: string) {
    if (!confirm("Delete this payment?")) return;
    setLoadingRowId(paymentId);
    try {
      await db.deletePayment(paymentId);
      toast.success("Payment deleted");
      if (selectedClient) await loadRowsForClient(selectedClient);
    } catch (err: any) {
      toast.error(err?.message ?? "Delete failed");
    } finally {
      setLoadingRowId(null);
    }
  }

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchClient.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
        Payments
      </h2>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-center">
        <div className="flex items-center space-x-2">
          <label htmlFor="clientSearch" className="text-sm font-medium text-gray-700">
            Search Customer:
          </label>
          <input
            type="text"
            id="clientSearch"
            placeholder="Enter customer name"
            value={searchClient}
            onChange={(e) => {
    const value = e.target.value;
    setSearchClient(value);

    if (value.trim() === "") {
      setSelectedClient(null); // reset select if field is empty
    } else {
      const firstMatch = clients.find((client) =>
        client.name.toLowerCase().includes(value.toLowerCase())
      );
      setSelectedClient(firstMatch ? firstMatch.id : null);
    }
  }}
            className="border rounded px-3 py-1 w-full sm:w-auto"
          />
        </div>

        <select
          value={selectedClient || ""}
          onChange={(e) => setSelectedClient(e.target.value || null)}
          className="border rounded px-3 py-1 w-full sm:w-auto"
        >
          <option value="">Select Customer</option>
          {filteredClients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-center">
        <div className="flex items-center space-x-2">
          <label htmlFor="invoiceSearch" className="text-sm font-medium text-gray-700">
            Search Invoice:
          </label>
          <input
            type="text"
            id="invoiceSearch"
            placeholder="Enter invoice number"
            value={searchInvoice}
            onChange={(e) => setSearchInvoice(e.target.value)}
            className="border rounded px-3 py-1 w-full sm:w-auto"
          />
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="dateSearch" className="text-sm font-medium text-gray-700">
            Search Date:
          </label>
          <input
            type="date"
            id="dateSearch"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="border rounded px-3 py-1 w-full sm:w-auto"
          />
        </div>
      </div>

      {selectedClient && rows.length === 0 && (
        <p className="text-gray-500">No bills found for this customer.</p>
      )}

      {selectedClient && rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Due
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Comment
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Commands
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((r) => {
                const bill = r.bill as any;
                const payment = r.payment as any | null;
                const billTotal = Number(bill.total ?? 0) - Number(bill.discount ?? 0);
                const paid = Number(payment?.paid ?? 0);
                const due = billTotal - paid;
                const status =
                  paid >= billTotal
                    ? "Paid"
                    : paid > 0
                    ? "Partially Paid"
                    : "Unpaid";

                const isEditing = String(editingBillId) === String(bill.id);
                const rowKey = String(bill.id);

                return (
                  <tr key={rowKey}>
                    <td className="px-3 py-2 text-sm">
                      {bill.bill_id ?? bill.id.slice(0, 8)}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {bill.created_at
                        ? String(bill.created_at).slice(0, 10)
                        : ""}
                    </td>
                    <td className="px-3 py-2 text-sm">{billTotal}</td>

                    <td className="px-3 py-2 text-sm">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingPaid}
                          onChange={(e) => {
                            const newValue = e.target.value === "" ? 0 : Number(e.target.value);
                            setEditingPaid(newValue);
                          }}
                          className="border rounded px-2 py-1 w-28"
                        />
                      ) : (
                        paid
                      )}
                    </td>

                    <td className="px-3 py-2 text-sm">
                      {isEditing ? Math.max(billTotal - editingPaid, 0) : due}
                    </td>

                    <td className="px-3 py-2 text-sm">
                      {isEditing
                        ? editingPaid >= billTotal
                          ? "Paid"
                          : editingPaid > 0
                          ? "Partially Paid"
                          : "Unpaid"
                        : status}
                    </td>

                    <td className="px-3 py-2 text-sm">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingComment}
                          onChange={(e) =>
                            setEditingComment(e.target.value)
                          }
                          className="border rounded px-2 py-1 w-48"
                        />
                      ) : (
                        payment?.comment ?? "-"
                      )}
                    </td>

                    <td className="px-3 py-2 text-sm space-x-2">
                      {isEditing ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => saveRow(r)}
                            disabled={loadingRowId === rowKey}
                            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                          >
                            {loadingRowId === rowKey ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex  flex-wrap gap-2">
                          <button
                            onClick={() => openEdit(r)}
                            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs sm:text-sm"
                          >
                            {payment?.id ? "Edit" : "Create Payment"}
                          </button>
                          {payment?.id && (
                            <button
                              onClick={() => handleDeletePayment(payment.id)}
                              className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs sm:text-sm"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}