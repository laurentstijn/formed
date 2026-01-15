import type { Order } from "@/types/product"

interface ProfessionalOrderEmailProps {
  order: Order
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

export function ProfessionalOrderEmail({ order, customer, companyInfo }: ProfessionalOrderEmailProps) {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = order.total_amount - subtotal

  const orderNumber = order.id.slice(0, 8).toUpperCase()
  const orderDate = new Date(order.created_at).toLocaleDateString("nl-NL", {
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bestelbevestiging</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                
                <!-- Header with Logo -->
                <!-- Applied website blush pink colors to header background -->
                <tr>
                  <td style="background: linear-gradient(135deg, #fef7f7 0%, #fef5f6 100%); padding: 40px 40px 30px; text-align: center; border-bottom: 3px solid #1a1a1a;">
                    <img src="${logoUrl}" alt="FORMD" style="max-width: 220px; height: auto; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
                    <p style="color: #666666; font-size: 13px; margin: 0; font-style: italic; letter-spacing: 1px;">formd in steel</p>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h1 style="color: #1a1a1a; font-size: 28px; margin: 0 0 10px; font-weight: 600;">Bedankt voor je bestelling!</h1>
                    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">Beste ${customer.firstName},</p>
                    <p style="color: #333333; font-size: 15px; line-height: 1.7; margin: 0 0 30px;">
                      Je bestelling is succesvol ontvangen en wordt met zorg voor je verwerkt. Hieronder vind je de details van je bestelling.
                    </p>

                    <!-- Order Number -->
                    <!-- Applied blush pink background to order info box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f7; border-radius: 6px; padding: 20px; margin-bottom: 30px; border: 1px solid #f7e8e8;">
                      <tr>
                        <td>
                          <p style="margin: 0; color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Bestelnummer</p>
                          <p style="margin: 5px 0 0; color: #1a1a1a; font-size: 20px; font-weight: 400;">#${orderNumber}</p>
                        </td>
                        <td align="right">
                          <p style="margin: 0; color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Besteldatum</p>
                          <p style="margin: 5px 0 0; color: #1a1a1a; font-size: 16px; font-weight: 500;">${orderDate}</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Products Table -->
                    <h2 style="color: #1a1a1a; font-size: 18px; margin: 0 0 20px; font-weight: 600; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px;">Jouw Producten</h2>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                      <thead>
                        <tr style="background-color: #1a1a1a;">
                          <th style="padding: 12px; text-align: left; color: #ffffff; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Product</th>
                          <th style="padding: 12px; text-align: center; color: #ffffff; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Aantal</th>
                          <th style="padding: 12px; text-align: right; color: #ffffff; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Prijs</th>
                          <th style="padding: 12px; text-align: right; color: #ffffff; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Totaal</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${order.items
                          .map(
                            (item, index) => `
                          <tr style="border-bottom: 1px solid #f7e8e8; ${index % 2 === 0 ? "background-color: #fef9f9;" : ""}">
                            <td style="padding: 15px 12px; color: #1a1a1a; font-size: 14px; font-weight: 500;">
                              ${item.name}${item.variant_name ? " - " + item.variant_name : ""}${item.color ? " (" + item.color + ")" : ""}
                            </td>
                            <td style="padding: 15px 12px; color: #333333; font-size: 14px; text-align: center;">${item.quantity}</td>
                            <td style="padding: 15px 12px; color: #333333; font-size: 14px; text-align: right;">€${item.price.toFixed(2)}</td>
                            <td style="padding: 15px 12px; color: #1a1a1a; font-size: 14px; font-weight: 600; text-align: right;">€${(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        `,
                          )
                          .join("")}
                      </tbody>
                    </table>

                    <!-- Totals -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                      <tr>
                        <td style="padding: 8px 0; color: #7f8c8d; font-size: 15px;" align="right">Subtotaal:</td>
                        <td style="padding: 8px 0; color: #2c3e50; font-size: 15px; font-weight: 500; width: 120px;" align="right">€${subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #7f8c8d; font-size: 15px;" align="right">Verzendkosten:</td>
                        <td style="padding: 8px 0; color: #2c3e50; font-size: 15px; font-weight: 500;" align="right">${shipping === 0 ? "Gratis" : "€" + shipping.toFixed(2)}</td>
                      </tr>
                      <tr style="border-top: 2px solid #34495e;">
                        <td style="padding: 15px 0 0; color: #2c3e50; font-size: 18px; font-weight: 600;" align="right">Totaal (incl. BTW):</td>
                        <td style="padding: 15px 0 0; color: #2c3e50; font-size: 22px; font-weight: 700;" align="right">€${order.total_amount.toFixed(2)}</td>
                      </tr>
                    </table>

                    <!-- Shipping Address -->
                    <!-- Applied blush pink to shipping address box -->
                    <div style="background-color: #fef7f7; border-left: 4px solid #1a1a1a; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                      <h3 style="color: #1a1a1a; font-size: 16px; margin: 0 0 15px; font-weight: 600;">Verzendadres</h3>
                      <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
                        ${customer.firstName} ${customer.lastName}<br>
                        ${order.address_line1}${order.address_line2 ? "<br>" + order.address_line2 : ""}<br>
                        ${order.postal_code} ${order.city}<br>
                        ${order.country}
                      </p>
                    </div>

                    <!-- Invoice Download Information Box -->
                    <div style="background-color: #fef7f7; border: 2px solid #1a1a1a; padding: 20px; margin-bottom: 30px; border-radius: 6px; text-align: center;">
                      <h3 style="color: #1a1a1a; font-size: 16px; margin: 0 0 10px; font-weight: 600;">📄 Factuur</h3>
                      <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
                        Je kunt je factuur downloaden via je account dashboard op onze website.
                      </p>
                    </div>

                    <p style="color: #34495e; font-size: 15px; line-height: 1.7; margin: 0;">
                      We houden je op de hoogte zodra je bestelling is verzonden. Bij vragen kun je ons altijd bereiken via <a href="mailto:${companyInfo.email}" style="color: #34495e; text-decoration: underline;">${companyInfo.email}</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <!-- Applied blush pink to footer background -->
                <tr>
                  <td style="background-color: #fef7f7; padding: 30px 40px; text-align: center; border-top: 1px solid #f7e8e8;">
                    <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 15px;">FORMD</p>
                    <p style="color: #666666; font-size: 13px; line-height: 1.6; margin: 0;">
                      ${companyInfo.address}<br>
                      BTW: ${companyInfo.vat}<br>
                      <a href="mailto:${companyInfo.email}" style="color: #666666; text-decoration: none;">${companyInfo.email}</a> | 
                      <a href="tel:${companyInfo.phone}" style="color: #666666; text-decoration: none;">${companyInfo.phone}</a>
                    </p>
                    <p style="color: #999999; font-size: 12px; margin: 15px 0 0; font-style: italic;">formd in steel</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

export function generateOrderConfirmationEmail(order: any): string {
  const companyInfo = {
    name: "FORMD",
    vat: "BE 0123.456.789",
    address: "Bedrijfsstraat 123, 2000 Antwerpen",
    email: "info@formd.be",
    phone: "+32 123 45 67 89",
  }

  const customer = {
    firstName: order.customer_name?.split(" ")[0] || "Klant",
    lastName: order.customer_name?.split(" ").slice(1).join(" ") || "",
    email: order.email || "",
    address: `${order.address_line1 || ""}, ${order.postal_code || ""} ${order.city || ""}, ${order.country || ""}`,
  }

  return ProfessionalOrderEmail({ order, customer, companyInfo })
}
