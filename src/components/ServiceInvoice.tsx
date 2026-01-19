import React from 'react';
import type { ServiceBill } from '../types';

interface ServiceInvoiceProps {
  serviceBill: ServiceBill;
}

export function ServiceInvoice({ serviceBill }: ServiceInvoiceProps) {
  // --- Helpers ---
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // --- Calculations ---
  // Assuming these fields exist in your DB, otherwise defaulting to 0
  // You can extend your ServiceBill type to include transport/advance if needed
  const transport = (serviceBill as any).transport || 0; 
  const advance = (serviceBill as any).advance || 0;
  const discount = serviceBill.discount || 0;
  
  // Recalculate item total to ensure accuracy or use serviceBill.total
  const itemTotal = serviceBill.service_items?.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0) || 0;
  
  const grandTotal = itemTotal + transport;
  const balance = grandTotal - advance - discount;

  // --- Table Filling Logic ---
  // We want the table to look like an A4 sheet even with few items
  const items = serviceBill.service_items || [];
  const MIN_ROWS = 14; // Minimum rows to fill the page visually
  const emptyRowsCount = Math.max(0, MIN_ROWS - items.length);
  const emptyRows = Array(emptyRowsCount).fill(null);

  return (
    <div className="invoice-wrapper">
      {/* INLINE STYLES FOR EXACT A4 PRINTING 
         (Scoped to this component via class names to avoid global conflicts)
      */}
      <style>{`
        .invoice-wrapper {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f0f0f0;
          padding: 20px;
          display: flex;
          justify-content: center;
        }
        
        /* A4 Container */
        .invoice-container {
          width: 210mm;
          min-height: 297mm;
          background: white;
          padding: 15px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          position: relative;
          box-sizing: border-box;
        }

        /* Header */
        .header {
          background-color: #0070c0;
          color: white;
          text-align: center;
          padding: 15px 0;
          border-bottom: 3px solid #004a80;
          margin-bottom: 15px;
        }
        .header h1 {
          margin: 0;
          font-family: 'Times New Roman', serif;
          font-size: 36px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .address-box {
          margin-top: 10px;
          font-size: 14px;
          line-height: 1.4;
        }

        /* Client Info */
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          align-items: flex-end;
        }
        .info-row {
            margin-bottom: 5px;
        }
        .info-label {
            font-weight: bold;
            display: inline-block;
            width: 60px;
        }
        .info-value {
            border-bottom: 1px solid black;
            display: inline-block;
            width: 300px;
            padding-left: 5px;
        }

        /* Serial No Box */
        .serial-box {
          border: 2px solid black;
          padding: 5px;
          width: 150px;
          text-align: right;
        }
        .serial-num {
          color: red;
          font-weight: bold;
          font-size: 18px;
          display: block;
        }

        /* Table */
        table.invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        table.invoice-table th {
          background-color: #0056b3;
          color: white;
          padding: 8px;
          border: 1px solid black;
          text-align: center;
          font-size: 14px;
        }
        table.invoice-table td {
          border: 1px solid black;
          padding: 5px;
          font-size: 14px;
          height: 24px; /* Fixed height for consistency */
        }
        
        /* Column Widths */
        .col-sn { width: 40px; text-align: center; }
        .col-particular { text-align: left; }
        .col-check { width: 50px; text-align: center; }
        .col-qty { width: 70px; text-align: center; }
        .col-rate { width: 90px; text-align: center; }
        .col-amount { width: 100px; text-align: center; font-weight: bold; }

        /* Footer */
        .footer-grid {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          border-top: 2px solid black;
          padding-top: 10px;
           page-break-inside: avoid;
        }
        .banking-info {
          width: 60%;
          font-size: 14px;
        }
        .email-text {
          color: #00b050;
          font-weight: bold;
          margin-bottom: 10px;
          display: block;
        }
        .totals-table {
          width: 35%;
          border-collapse: collapse;
        }
        .totals-table td {
          padding: 5px;
          border: 1px solid black;
        }
        .totals-label {
          font-weight: bold;
          text-align: right;
          background: #f9f9f9;
        }
        .totals-value {
          text-align: right;
          font-weight: bold;
        }

        /* Print Settings */
        @page {
  size: A4;
  margin: 0;
}

@media print {
  body {
    margin: 0;
    padding: 0;
  }

  body * {
    visibility: hidden;
  }

  .invoice-wrapper,
  .invoice-wrapper * {
    visibility: visible;
  }

  .invoice-wrapper {
    background: white;
    padding: 0;
    position: absolute;
    left: 0;
    top: 0;
    width: 210mm;
    height: 297mm;
  }

  .invoice-container {
    width: 210mm;
    height: 297mm;
    margin: 0;
    padding: 15mm;
    box-shadow: none;
    box-sizing: border-box;
    page-break-inside: avoid;
    overflow: hidden;
  }

  .header,
  th {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
     margin-bottom: 10px;
  padding-top: 12px;
  padding-bottom: 12px;
  }
}
      `}</style>

      <div className="invoice-container">
        
        {/* HEADER */}
        <div className="header">
          <h1>ALI ELECTRIC SERVICES</h1>
          <div className="address-box">
            <strong>Address: Punial Road Near Shah City Mall Gilgit</strong><br />
            Electrical Works, Civil Works, General Construction, CCTV Camera<br />
            Networking Equipment & Maintenance, repairing, and general order supplier
          </div>
        </div>

        {/* CUSTOMER INFO */}
        <div className="info-section">
          <div>
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span className="info-value">{serviceBill.client?.name || "Unknown Customer"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Date:</span>
              <span className="info-value">{formatDate(serviceBill.created_at)}</span>
            </div>
          </div>
          
          <div className="serial-box">
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#d00' }}>S.No / Inv#</span>
            <span className="serial-num">{serviceBill.id.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>

        {/* TABLE */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th className="col-sn">S#</th>
              <th className="col-particular">Particular</th>
              <th className="col-check">Check</th>
              <th className="col-qty">Qty.</th>
              <th className="col-rate">Rate</th>
              <th className="col-amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            {/* Render Actual Items */}
            {items.map((item, index) => (
              <tr key={index}>
                <td className="col-sn">{index + 1}</td>
                <td className="col-particular">{item.service?.name}</td>
                <td className="col-check">✔</td>
                <td className="col-qty">{item.quantity}</td>
                <td className="col-rate">{item.price_at_time}</td>
                <td className="col-amount" style={{ color: 'red' }}>
                  {(item.price_at_time * item.quantity).toFixed(0)}
                </td>
              </tr>
            ))}

            {/* Render Empty Rows for Layout */}
            {emptyRows.map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="col-sn">{items.length + i + 1}</td>
                <td className="col-particular"></td>
                <td className="col-check"></td>
                <td className="col-qty"></td>
                <td className="col-rate"></td>
                <td className="col-amount"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* FOOTER */}
        <div className="footer-grid">
          <div className="banking-info">
            <span className="email-text">Email: ali796569@gmail.com</span>
            <p><strong>Bank Details:</strong><br />
            Habib Metro<br />
            Acc Title: Ali Electric Store<br />
            6026220311714138081</p>
            <p style={{marginTop: '5px'}}>EasyPaisa: 03109093409 (Ali Haider)</p>
            
            <div style={{ marginTop: '50px', textAlign: 'center', width: '200px', borderTop: '1px solid black', paddingTop: '5px' }}>
              Signature
            </div>
          </div>

          <table className="totals-table">
            <tbody>
              <tr>
                <td className="totals-label">Transport Charges:</td>
                <td className="totals-value">{transport}</td>
              </tr>
              <tr>
                <td className="totals-label">Total:</td>
                <td className="totals-value" style={{ color: 'black' }}>{grandTotal.toFixed(0)}</td>
              </tr>
              <tr>
                <td className="totals-label">Advance:</td>
                <td className="totals-value">{advance}</td>
              </tr>
              <tr>
                <td className="totals-label">Discount:</td>
                <td className="totals-value">{discount}</td>
              </tr>
              <tr>
                <td className="totals-label">Balance:</td>
                <td className="totals-value" style={{ color: 'red', fontSize: '16px' }}>{balance.toFixed(0)}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}