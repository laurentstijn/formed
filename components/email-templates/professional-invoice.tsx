import type { Order } from "@/types/product"

interface ProfessionalInvoiceProps {
  order: Order
  invoiceNumber: string
  customer: {
    firstName: string
    lastName: string
    email: string
    address: string
  }
  companyInfo: {
    name: string
    vat: string
    address: string
    email: string
    phone: string
  }
}

export function ProfessionalInvoice({ order, invoiceNumber, customer, companyInfo }: ProfessionalInvoiceProps) {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = order.total_amount - subtotal
  const btwPercentage = 21
  const totalExclBtw = order.total_amount / (1 + btwPercentage / 100)
  const btwAmount = order.total_amount - totalExclBtw

  const orderNumber = order.id.slice(0, 8).toUpperCase()
  const invoiceDate = new Date(order.created_at).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const logoUrl =
    "https://txseeeyngm0nlung.public.blob.vercel-storage.com/products/1767593598250-logo%27s_primary%20logo.png"

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Factuur ${invoiceNumber}</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
        
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 40px;">
          <tr>
            <td width="50%" style="vertical-align: top;">
              <img src="${logoUrl}" alt="FORMD" style="max-width: 200px; height: auto; margin-bottom: 10px; display: block;">
              <p style="margin: 0; color: #888888; font-size: 12px; font-style: italic; letter-spacing: 1px;">formd in steel</p>
            </td>
            <td width="50%" style="vertical-align: top; text-align: right;">
              <h1 style="margin: 0 0 10px; color: #1a1a1a; font-size: 36px; font-weight: 700;">FACTUUR</h1>
              <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.8;">
                <strong>Factuurnummer:</strong> ${invoiceNumber}<br>
                <strong>Factuurdatum:</strong> ${invoiceDate}<br>
                <strong>Bestelnummer:</strong> #${orderNumber}
              </p>
            </td>
          </tr>
        </table>

        <!-- Addresses -->
        <!-- Removed all background colors from address boxes -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 40px;">
          <tr>
            <td width="50%" style="vertical-align: top; padding-right: 20px;">
              <div style="padding: 20px; border: 1px solid #e0e0e0; border-radius: 6px;">
                <h3 style="margin: 0 0 15px; color: #1a1a1a; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Van</h3>
                <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.7;">
                  <strong style="font-size: 16px; display: block; margin-bottom: 8px;">${companyInfo.name}</strong>
                  ${companyInfo.address}<br>
                  BTW: ${companyInfo.vat}<br>
                  ${companyInfo.email}<br>
                  ${companyInfo.phone}
                </p>
              </div>
            </td>
            <td width="50%" style="vertical-align: top; padding-left: 20px;">
              <div style="padding: 20px; border: 1px solid #e0e0e0; border-radius: 6px;">
                <h3 style="margin: 0 0 15px; color: #1a1a1a; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Aan</h3>
                <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.7;">
                  <strong style="font-size: 16px; display: block; margin-bottom: 8px;">${customer.firstName} ${customer.lastName}</strong>
                  ${order.address_line1}${order.address_line2 ? "<br>" + order.address_line2 : ""}<br>
                  ${order.postal_code} ${order.city}<br>
                  ${order.country}<br>
                  ${customer.email}
                </p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Products Table -->
        <!-- Changed table header to white background with black border -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #ffffff; border: 2px solid #1a1a1a;">
              <th style="padding: 15px; text-align: left; color: #1a1a1a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #1a1a1a; font-weight: 600;">Omschrijving</th>
              <th style="padding: 15px; text-align: center; color: #1a1a1a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #1a1a1a; width: 80px; font-weight: 600;">Aantal</th>
              <th style="padding: 15px; text-align: right; color: #1a1a1a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #1a1a1a; width: 100px; font-weight: 600;">Prijs</th>
              <th style="padding: 15px; text-align: right; color: #1a1a1a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #1a1a1a; width: 100px; font-weight: 600;">Totaal</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item, index) => `
              <tr style="background-color: #ffffff;">
                <td style="padding: 12px 15px; color: #1a1a1a; font-size: 14px; border: 1px solid #d0d0d0;">${item.name}</td>
                <td style="padding: 12px 15px; color: #333333; font-size: 14px; text-align: center; border: 1px solid #d0d0d0;">${item.quantity}</td>
                <td style="padding: 12px 15px; color: #333333; font-size: 14px; text-align: right; border: 1px solid #d0d0d0;">€${item.price.toFixed(2)}</td>
                <td style="padding: 12px 15px; color: #1a1a1a; font-size: 14px; font-weight: 600; text-align: right; border: 1px solid #d0d0d0;">€${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `,
              )
              .join("")}
            ${
              shipping > 0
                ? `
              <tr>
                <td style="padding: 12px 15px; color: #1a1a1a; font-size: 14px; border: 1px solid #d0d0d0;">Verzendkosten</td>
                <td style="padding: 12px 15px; border: 1px solid #d0d0d0;"></td>
                <td style="padding: 12px 15px; border: 1px solid #d0d0d0;"></td>
                <td style="padding: 12px 15px; color: #1a1a1a; font-size: 14px; font-weight: 600; text-align: right; border: 1px solid #d0d0d0;">€${shipping.toFixed(2)}</td>
              </tr>
            `
                : ""
            }
          </tbody>
        </table>

        <!-- Totals -->
        <!-- Changed total row to white background with black border -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 40px;">
          <tr>
            <td width="60%"></td>
            <td width="40%">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 15px; color: #7f8c8d; font-size: 14px; border-bottom: 1px solid #d0d0d0;">Subtotaal excl. BTW</td>
                  <td style="padding: 8px 15px; color: #1a1a1a; font-size: 14px; text-align: right; border-bottom: 1px solid #d0d0d0;">€${totalExclBtw.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 15px; color: #7f8c8d; font-size: 14px; border-bottom: 1px solid #d0d0d0;">BTW (${btwPercentage}%)</td>
                  <td style="padding: 8px 15px; color: #1a1a1a; font-size: 14px; text-align: right; border-bottom: 1px solid #d0d0d0;">€${btwAmount.toFixed(2)}</td>
                </tr>
                <tr style="background-color: #ffffff; border: 2px solid #1a1a1a;">
                  <td style="padding: 15px; color: #1a1a1a; font-size: 16px; font-weight: 700;">TOTAAL INCL. BTW</td>
                  <td style="padding: 15px; color: #1a1a1a; font-size: 20px; font-weight: 700; text-align: right;">€${order.total_amount.toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Payment Info -->
        <!-- Removed pink background from payment info box -->
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-radius: 6px; margin-bottom: 40px;">
          <h3 style="margin: 0 0 10px; color: #1a1a1a; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Betalingsinformatie</h3>
          <p style="margin: 0; color: #333333; font-size: 13px; line-height: 1.6;">
            Betaling reeds ontvangen. Hartelijk dank voor uw vertrouwen in ${companyInfo.name}.
          </p>
        </div>

        <!-- Footer -->
        <!-- Removed pink background from footer -->
        <div style="border-top: 2px solid #1a1a1a; padding: 30px 20px; text-align: center; margin-top: 40px;">
          <p style="margin: 0 0 10px; color: #1a1a1a; font-size: 16px; font-weight: 600;">FORMD</p>
          <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.8;">
            ${companyInfo.address} | BTW: ${companyInfo.vat}<br>
            <a href="mailto:${companyInfo.email}" style="color: #666666; text-decoration: none;">${companyInfo.email}</a> | 
            <a href="tel:${companyInfo.phone}" style="color: #666666; text-decoration: none;">${companyInfo.phone}</a>
          </p>
          <p style="margin: 15px 0 0; color: #999999; font-size: 11px; font-style: italic;">
            formd in steel
          </p>
        </div>

      </body>
    </html>
  `
}
