import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

function generateShippingEmailHTML(
  order: any,
  customerName: string,
  orderNumber: string,
  domain: string,
  trackingNumber?: string | null,
  trackingUrl?: string | null,
): string {
  const fromEmail = "info@formd.be"

  const logoUrl = "https://txseeeyngm0nlung.public.blob.vercel-storage.com/products/1767593598250-logo%27s_primary%20logo.png"

  const itemsHTML = order.items
    .map(
      (item: any, index: number) => `
    <tr style="border-bottom: 1px solid #f7e8e8; ${index % 2 === 0 ? "background-color: #fef9f9;" : ""}">
      <td style="padding: 15px 12px; color: #1a1a1a; font-size: 14px; font-weight: 500;">
        <div style="display: flex; align-items: center; gap: 15px;">
          ${item.image && !item.image.startsWith('data:') ? `<img src="${item.image}" alt="${item.name}" style="width: 80px; height: auto; border-radius: 4px; border: 1px solid #eaeaea; display: block;" />` : ''}
          <div>
            ${item.name}${item.variant_name ? " - " + item.variant_name : ""}${item.color ? " (" + item.color + ")" : ""}
          </div>
        </div>
      </td>
      <td style="padding: 15px 12px; color: #333333; font-size: 14px; text-align: center;">${item.quantity}</td>
    </tr>
  `,
    )
    .join("")

  const trackingHTML =
    trackingNumber || trackingUrl
      ? `
    <!-- Track & Trace Box with blush pink theme -->
    <div style="background-color: #fef7f7; border: 2px solid #1a1a1a; padding: 24px; margin: 24px 0; border-radius: 6px; text-align: center;">
      <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">📦 Track & Trace</h3>
      ${
        trackingNumber
          ? `
        <p style="margin: 0 0 12px 0; color: #666666; font-size: 15px;">
          <strong style="color: #1a1a1a;">Trackingnummer:</strong><br />
          <span style="font-family: 'Courier New', monospace; font-size: 16px; color: #1a1a1a; background: #ffffff; padding: 10px 15px; border-radius: 4px; border: 1px solid #f7e8e8; display: inline-block; margin-top: 8px; font-weight: 600;">${trackingNumber}</span>
        </p>
      `
          : ""
      }
      ${
        trackingUrl
          ? `
        <p style="margin: 16px 0 12px 0;">
          <a href="${trackingUrl}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
            🔍 Volg je pakket
          </a>
        </p>
      `
          : ""
      }
      <p style="margin: 8px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
        ${trackingUrl ? "Klik op de knop hierboven om de actuele status van je pakket te bekijken." : "Je kunt dit nummer gebruiken bij je vervoerder om je pakket te volgen."}
      </p>
    </div>
  `
      : ""

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Je pakket is onderweg!</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                
                <!-- Header with Logo -->
                <tr>
                  <td style="background: linear-gradient(135deg, #fef7f7 0%, #fef5f6 100%); padding: 40px 40px 30px; text-align: center; border-bottom: 3px solid #1a1a1a;">
                    <img src="${logoUrl}" alt="FORMD" style="max-width: 220px; height: auto; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
                    <p style="color: #666666; font-size: 13px; margin: 0; font-style: italic; letter-spacing: 1px;">formd in steel</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h1 style="color: #1a1a1a; font-size: 28px; margin: 0 0 10px; font-weight: 600;">Je pakket is onderweg!</h1>
                    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">Beste ${customerName},</p>
                    
                    <p style="color: #333333; font-size: 15px; line-height: 1.7; margin: 0 0 30px;">
                      Goed nieuws! Je bestelling <strong>#${orderNumber}</strong> is zojuist verzonden en is nu onderweg naar jou. Je kunt je pakket binnen enkele werkdagen verwachten.
                    </p>

                    ${trackingHTML}

                    <!-- Shipping Address -->
                    <div style="background-color: #fef7f7; border-left: 4px solid #1a1a1a; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                      <h3 style="color: #1a1a1a; font-size: 16px; margin: 0 0 15px; font-weight: 600;">Verzendadres</h3>
                      <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
                        ${customerName}<br>
                        ${order.address_line1}${order.address_line2 ? "<br>" + order.address_line2 : ""}<br>
                        ${order.postal_code} ${order.city}<br>
                        ${order.country}
                      </p>
                    </div>

                    <!-- Products -->
                    <h2 style="color: #1a1a1a; font-size: 18px; margin: 0 0 20px; font-weight: 600; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px;">Producten in dit pakket</h2>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                      <thead>
                        <tr style="background-color: #1a1a1a;">
                          <th style="padding: 12px; text-align: left; color: #ffffff; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Product</th>
                          <th style="padding: 12px; text-align: center; color: #ffffff; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Aantal</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHTML}
                      </tbody>
                    </table>

                    <p style="color: #333333; font-size: 15px; line-height: 1.7; margin: 0 0 12px 0;">
                      Heb je vragen over je verzending? Neem gerust contact met ons op via <a href="mailto:${fromEmail}" style="color: #1a1a1a; text-decoration: underline; font-weight: 500;">${fromEmail}</a>
                    </p>
                    
                    <p style="color: #333333; font-size: 15px; line-height: 1.7; margin: 0;">
                      Bedankt voor je aankoop bij FORMD!
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #fef7f7; padding: 30px 40px; text-align: center; border-top: 1px solid #f7e8e8;">
                    <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 15px;">FORMD</p>
                    <p style="color: #666666; font-size: 13px; line-height: 1.6; margin: 0;">
                      België<br>
                      <a href="mailto:${fromEmail}" style="color: #666666; text-decoration: none;">${fromEmail}</a>
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

export async function POST(request: NextRequest) {
  try {
    const { order, email, domain, tracking_number, tracking_url } = await request.json()

    console.log("[v0] Sending shipping email for order:", order.id.substring(0, 8))

    const orderNumber = order.id.substring(0, 8)

    const result = await resend.emails.send({
      from: `FORMD <info@formd.be>`,
      to: email,
      subject: `📦 Je bestelling #${orderNumber} is verzonden!`,
      html: generateShippingEmailHTML(order, order.first_name, orderNumber, domain, tracking_number, tracking_url),
    })

    console.log("[v0] Shipping confirmation email sent:", result)

    return NextResponse.json({
      success: true,
      message: "Verzendbevestiging verzonden",
      result,
    })
  } catch (error) {
    console.error("[v0] Error sending shipping email:", error)
    return NextResponse.json({ error: "Failed to send shipping email", details: error }, { status: 500 })
  }
}
