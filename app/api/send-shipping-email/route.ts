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

  const logoUrl = "/images/formed-primary-20logo.png"

  const itemsHTML = order.items
    .map(
      (item: any, index: number) => `
    <tr style="${index % 2 === 0 ? "background-color: #f8f9fa;" : ""}">
      <td style="padding: 15px 12px; color: #2c3e50; font-size: 14px; border-bottom: 1px solid #ecf0f1;">
        <strong>${item.name}</strong><br>
        <span style="color: #7f8c8d; font-size: 13px;">Aantal: ${item.quantity}</span>
      </td>
    </tr>
  `,
    )
    .join("")

  const trackingHTML =
    trackingNumber || trackingUrl
      ? `
    <div style="background: linear-gradient(135deg, #27ae60 0%, #229954 100%); padding: 24px; margin: 24px 0; border-radius: 8px;">
      <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #ffffff;">📦 Track & Trace</h3>
      ${
        trackingNumber
          ? `
        <p style="margin: 0 0 12px 0; color: #ecf0f1; font-size: 15px;">
          <strong style="color: #ffffff;">Trackingnummer:</strong><br />
          <span style="font-family: 'Courier New', monospace; font-size: 16px; color: #2c3e50; background: #ffffff; padding: 10px 15px; border-radius: 4px; display: inline-block; margin-top: 8px; font-weight: 600;">${trackingNumber}</span>
        </p>
      `
          : ""
      }
      ${
        trackingUrl
          ? `
        <p style="margin: 16px 0 12px 0;">
          <a href="${trackingUrl}" style="display: inline-block; background-color: #ffffff; color: #27ae60; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
            🔍 Volg je pakket
          </a>
        </p>
      `
          : ""
      }
      <p style="margin: 8px 0 0 0; color: #ecf0f1; font-size: 14px; line-height: 1.6;">
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
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header with Logo -->
                <tr>
                  <td style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); padding: 40px 40px 30px; text-align: center;">
                    <img src="${logoUrl}" alt="FORMD" style="max-width: 200px; height: auto; margin-bottom: 15px;">
                    <p style="color: #ecf0f1; font-size: 13px; margin: 0; font-style: italic;">formd in steel</p>
                  </td>
                </tr>

                <!-- Success Banner -->
                <tr>
                  <td style="background: linear-gradient(135deg, #27ae60 0%, #229954 100%); padding: 30px; text-align: center;">
                    <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 28px; font-weight: 700;">✓ Je pakket is onderweg!</h1>
                    <p style="margin: 0; color: #ecf0f1; font-size: 16px;">Bestelling #${orderNumber}</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px 0; color: #7f8c8d; font-size: 16px; line-height: 1.7;">
                      Beste ${customerName},
                    </p>
                    
                    <p style="margin: 0 0 30px 0; color: #34495e; font-size: 15px; line-height: 1.7;">
                      Goed nieuws! Je bestelling is zojuist verzonden en is nu onderweg naar jou. Je kunt je pakket binnen enkele werkdagen verwachten.
                    </p>

                    ${trackingHTML}

                    <!-- Shipping Address -->
                    <div style="background-color: #f8f9fa; border-left: 4px solid #34495e; padding: 20px; margin-bottom: 30px;">
                      <h3 style="color: #2c3e50; font-size: 16px; margin: 0 0 15px; font-weight: 600;">Verzendadres</h3>
                      <p style="margin: 0; color: #34495e; font-size: 14px; line-height: 1.6;">
                        ${order.address_line1}${order.address_line2 ? "<br>" + order.address_line2 : ""}<br>
                        ${order.postal_code} ${order.city}<br>
                        ${order.country}
                      </p>
                    </div>

                    <!-- Products -->
                    <h3 style="color: #2c3e50; font-size: 16px; margin: 0 0 15px; font-weight: 600;">Producten in dit pakket</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; border: 1px solid #ecf0f1; border-radius: 6px; overflow: hidden;">
                      ${itemsHTML}
                    </table>

                    <p style="margin: 0 0 12px 0; color: #34495e; font-size: 15px; line-height: 1.7;">
                      Heb je vragen over je verzending? Neem gerust contact met ons op via <a href="mailto:${fromEmail}" style="color: #34495e; text-decoration: underline;">${fromEmail}</a>
                    </p>
                    
                    <p style="margin: 0; color: #34495e; font-size: 15px; line-height: 1.7;">
                      Bedankt voor je aankoop bij FORMD!
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #2c3e50; padding: 30px 40px; text-align: center;">
                    <p style="color: #ecf0f1; font-size: 16px; font-weight: 600; margin: 0 0 10px;">FORMD</p>
                    <p style="color: #95a5a6; font-size: 13px; line-height: 1.6; margin: 0;">
                      België<br>
                      <a href="mailto:${fromEmail}" style="color: #95a5a6; text-decoration: none;">${fromEmail}</a>
                    </p>
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
