import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    const supabase = await createClient()

    // Fetch order with customer details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        customers (*)
      `)
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Fetch invoice settings
    const { data: settings } = await supabase.from("invoice_settings").select("*").single()

    // Generate invoice number
    const invoiceNumber = `INV-${order.id.slice(0, 8).toUpperCase()}`
    const orderDate = new Date(order.created_at).toLocaleDateString("nl-BE")

    // Calculate totals
    const items = order.items || []
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const shippingCost = order.shipping_cost || 0
    const subtotalWithShipping = subtotal + shippingCost
    const btw = subtotalWithShipping * 0.21
    const total = subtotalWithShipping + btw

    // Generate HTML invoice (reusing the professional invoice template)
    const invoiceHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { 
      size: A4;
      margin: 15mm 20mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1a1a1a;
      line-height: 1.5;
      padding: 20px;
      background: white;
      font-size: 13px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #000;
    }
    .logo-section h1 {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 2px;
    }
    .tagline {
      font-style: italic;
      color: #666;
      font-size: 12px;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .info-box {
      flex: 1;
      margin-right: 20px;
      padding: 15px;
      background: white;
      border: 1px solid #ddd;
    }
    .info-box h3 {
      font-weight: 600;
      margin-bottom: 10px;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: white;
      border-top: 2px solid #000;
      border-bottom: 2px solid #000;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #ddd;
    }
    .totals {
      margin-left: auto;
      width: 300px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }
    .totals-row.final {
      border-top: 2px solid #000;
      font-weight: 700;
      font-size: 16px;
      padding-top: 12px;
      margin-top: 8px;
    }
    .payment-info {
      margin-top: 30px;
      padding: 15px;
      background: white;
      border: 1px solid #ddd;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 11px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="logo-section">
        <h1>FORMD</h1>
        <p class="tagline">formd in steel</p>
      </div>
      <div class="invoice-meta">
        <div class="invoice-title">FACTUUR</div>
        <p><strong>Factuurnummer:</strong> ${invoiceNumber}</p>
        <p><strong>Factuurdatum:</strong> ${orderDate}</p>
        <p><strong>Bestelnummer:</strong> #${order.id.slice(0, 8).toUpperCase()}</p>
      </div>
    </div>

    <div class="info-section">
      <div class="info-box">
        <h3>VAN</h3>
        <p><strong>FORMD</strong></p>
        <p>${settings?.company_address || "Bedrijfsstraat 123"}</p>
        <p>BTW: ${settings?.vat_number || "BE0123456789"}</p>
        <p>${settings?.email || "info@formd.be"}</p>
        <p>${settings?.phone || "+32 123 45 67 89"}</p>
      </div>
      <div class="info-box">
        <h3>AAN</h3>
        <p><strong>${order.customers?.name || order.customer_name}</strong></p>
        <p>${order.shipping_address}</p>
        <p>${order.shipping_city}</p>
        <p>${order.customers?.email || order.email}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>OMSCHRIJVING</th>
          <th style="text-align: center;">AANTAL</th>
          <th style="text-align: right;">PRIJS</th>
          <th style="text-align: right;">TOTAAL</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item: any) => `
          <tr>
            <td>${item.name}${item.color ? ` <span style="color: #666;">- ${item.color}</span>` : ""}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">€${item.price.toFixed(2)}</td>
            <td style="text-align: right;">€${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `,
          )
          .join("")}
        ${
          shippingCost > 0
            ? `
          <tr>
            <td>Verzendkosten</td>
            <td></td>
            <td></td>
            <td style="text-align: right;">€${shippingCost.toFixed(2)}</td>
          </tr>
        `
            : ""
        }
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span>Subtotaal excl. BTW</span>
        <span>€${subtotalWithShipping.toFixed(2)}</span>
      </div>
      <div class="totals-row">
        <span>BTW (21%)</span>
        <span>€${btw.toFixed(2)}</span>
      </div>
      <div class="totals-row final">
        <span>TOTAAL INCL. BTW</span>
        <span>€${total.toFixed(2)}</span>
      </div>
    </div>

    <div class="payment-info">
      <h3>BETALINGSINFORMATIE</h3>
      <p>Betaling reeds ontvangen. Hartelijk dank voor uw vertrouwen in FORMD.</p>
    </div>

    <div class="footer">
      <p><strong>FORMD</strong></p>
      <p>${settings?.company_address || "Bedrijfsstraat 123"} | BTW: ${settings?.vat_number || "BE0123456789"}</p>
      <p>${settings?.email || "info@formd.be"} | ${settings?.phone || "+32 123 45 67 89"}</p>
      <p style="margin-top: 10px;"><em>formd in steel</em></p>
    </div>
  </div>
</body>
</html>`

    // Return the HTML (Resend can convert HTML to PDF automatically)
    return NextResponse.json({
      html: invoiceHTML,
      filename: `factuur-${invoiceNumber}.pdf`,
    })
  } catch (error) {
    console.error("[v0] Error generating invoice PDF:", error)
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 })
  }
}
