import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"
import { ProfessionalOrderEmail } from "@/components/email-templates/professional-order-email"

const resend = new Resend(process.env.RESEND_API_KEY)

// Helper functions to generate HTML email strings instead of React components
function replaceTemplateVariables(template: string, data: Record<string, string>) {
  let result = template
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g")
    result = result.replace(regex, value)
  })
  return result
}

export async function POST(request: NextRequest) {
  try {
    const { order, domain } = await request.json()

    console.log("[v0] === EMAIL SENDING START ===")
    console.log("[v0] Order ID:", order.id)
    console.log("[v0] Customer email:", order.email)
    console.log("[v0] Domain:", domain)

    const supabase = await createClient()

    const { data: settings } = await supabase.from("settings").select("*").maybeSingle()

    const fromEmail = "info@formd.be"
    const adminEmail = "info@formd.be"

    console.log("[v0] RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY)
    console.log("[v0] RESEND_API_KEY length:", process.env.RESEND_API_KEY?.length || 0)

    const orderDate = new Date(order.created_at).toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })

    const companyInfo = {
      name: settings?.company_name || "FORMD",
      vat: settings?.company_vat || "BE 0XXX.XXX.XXX",
      address: settings?.company_address || "België",
      email: settings?.company_email || "info@formd.be",
      phone: settings?.company_phone || "+32 XXX XX XX XX",
    }

    const customer = {
      firstName: order.first_name,
      lastName: order.last_name,
      email: order.email,
      address: `${order.address_line1}, ${order.postal_code} ${order.city}, ${order.country}`,
    }

    let customerEmailResult
    let adminEmailResult
    let emailsSent = true
    let emailError = null

    if (!process.env.RESEND_API_KEY) {
      console.error("[v0] ❌ RESEND_API_KEY not configured!")
      return NextResponse.json({
        success: true,
        emailsSent: false,
        message: "Bestelling geplaatst, emails worden later verzonden",
        error: "RESEND_API_KEY not configured",
      })
    }

    console.log("[v0] Sending order emails for order:", order.id.substring(0, 8))
    console.log("[v0] Customer email:", order.email)
    console.log("[v0] RESEND_API_KEY configured:", !!process.env.RESEND_API_KEY)

    try {
      const customerSubject = settings?.order_email_subject || `Bedankt voor je bestelling! 🎉`

      const customerHtml = ProfessionalOrderEmail({ order, customer, companyInfo })

      console.log("[v0] === CUSTOMER EMAIL DETAILS ===")
      console.log("[v0] From:", `FORMD <${fromEmail}>`)
      console.log("[v0] To:", order.email)
      console.log("[v0] Subject:", customerSubject)
      console.log("[v0] HTML length:", customerHtml.length)
      console.log("[v0] Sending customer email now...")

      customerEmailResult = await resend.emails.send({
        from: `FORMD <${fromEmail}>`,
        to: order.email,
        subject: customerSubject,
        html: customerHtml,
      })

      console.log("[v0] ✅ Customer email Resend response:", JSON.stringify(customerEmailResult, null, 2))

      if (customerEmailResult.error) {
        console.error("[v0] ❌ Customer email error from Resend:", customerEmailResult.error)
        emailsSent = false
        emailError = customerEmailResult.error
      }
    } catch (error: any) {
      emailsSent = false
      emailError = error?.message || "Email domain not verified"
      console.error("[v0] ❌ CUSTOMER EMAIL EXCEPTION:", {
        message: error?.message,
        statusCode: error?.statusCode,
        name: error?.name,
        response: error?.response?.data,
        fullError: JSON.stringify(error, null, 2),
      })
    }

    try {
      const adminSubject = settings?.admin_email_subject || `Nieuwe bestelling ontvangen`

      const subtotal = order.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
      const shipping = order.total_amount - subtotal

      const itemsHTML = order.items
        .map(
          (item: any, index: number) => `
        <tr style="${index % 2 === 0 ? "background-color: #f8f9fa;" : ""}">
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; display: flex; gap: 16px; align-items: center;">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 120px; height: auto; object-fit: contain; border-radius: 4px; border: 1px solid #ddd;" />` : ''}
            <span style="line-height: 1.5; font-size: 14px;">${item.name}${item.color && !item.name.includes(item.color) ? " - " + item.color : ""}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">€${item.price.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">€${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `,
        )
        .join("")

      const adminHtml = `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"></head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">🔔 Nieuwe Bestelling</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ecf0f1; border-radius: 6px; padding: 20px; margin-bottom: 30px;">
                          <tr>
                            <td>
                              <p style="margin: 0; color: #7f8c8d; font-size: 13px; text-transform: uppercase;">Bestelnummer</p>
                              <p style="margin: 5px 0; color: #2c3e50; font-size: 20px; font-weight: 600;">#${order.id.slice(0, 8).toUpperCase()}</p>
                            </td>
                            <td align="right">
                              <p style="margin: 0; color: #7f8c8d; font-size: 13px; text-transform: uppercase;">Datum</p>
                              <p style="margin: 5px 0; color: #2c3e50; font-size: 16px;">${orderDate}</p>
                            </td>
                          </tr>
                        </table>
                        
                        <h2 style="color: #2c3e50; font-size: 18px; margin: 0 0 15px; font-weight: 600;">Klantgegevens</h2>
                        <p style="margin: 0 0 20px; color: #34495e; font-size: 15px; line-height: 1.6;">
                          <strong>${order.first_name} ${order.last_name}</strong><br>
                          ${order.email}<br>
                          ${order.address_line1}${order.address_line2 ? ", " + order.address_line2 : ""}<br>
                          ${order.postal_code} ${order.city}<br>
                          ${order.country}
                        </p>

                        <h2 style="color: #2c3e50; font-size: 18px; margin: 0 0 15px; font-weight: 600; border-bottom: 2px solid #34495e; padding-bottom: 10px;">Producten</h2>
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
                          <thead>
                            <tr style="background-color: #34495e;">
                              <th style="padding: 12px; text-align: left; color: #ffffff; font-size: 13px;">Product</th>
                              <th style="padding: 12px; text-align: center; color: #ffffff; font-size: 13px;">Aantal</th>
                              <th style="padding: 12px; text-align: right; color: #ffffff; font-size: 13px;">Prijs</th>
                              <th style="padding: 12px; text-align: right; color: #ffffff; font-size: 13px;">Totaal</th>
                            </tr>
                          </thead>
                          <tbody>${itemsHTML}</tbody>
                        </table>

                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 8px 0; color: #7f8c8d; font-size: 15px;" align="right">Subtotaal:</td>
                            <td style="padding: 8px 0; color: #2c3e50; font-size: 15px; font-weight: 500; width: 120px;" align="right">€${subtotal.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #7f8c8d; font-size: 15px;" align="right">Verzendkosten:</td>
                            <td style="padding: 8px 0; color: #2c3e50; font-size: 15px; font-weight: 500;" align="right">${shipping === 0 ? "Gratis" : "€" + shipping.toFixed(2)}</td>
                          </tr>
                          <tr style="border-top: 2px solid #34495e;">
                            <td style="padding: 15px 0 0; color: #2c3e50; font-size: 18px; font-weight: 600;" align="right">Totaal:</td>
                            <td style="padding: 15px 0 0; color: #2c3e50; font-size: 22px; font-weight: 700;" align="right">€${order.total_amount.toFixed(2)}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #2c3e50; padding: 20px; text-align: center;">
                        <p style="color: #ecf0f1; font-size: 14px; margin: 0;">FORMD Admin Notificatie</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `

      console.log("[v0] === ADMIN EMAIL DETAILS ===")
      console.log("[v0] From:", `FORMD <${fromEmail}>`)
      console.log("[v0] To:", adminEmail)
      console.log("[v0] Subject:", adminSubject)
      console.log("[v0] Sending admin email now...")

      const attachments: any[] = [];
      order.items.forEach((item: any) => {
        if (item.dxf_string && item.dxf_filename) {
          attachments.push({
            filename: item.dxf_filename,
            content: Buffer.from(item.dxf_string, 'utf-8')
          });
        }
      });

      adminEmailResult = await resend.emails.send({
        from: `FORMD <${fromEmail}>`,
        to: adminEmail,
        subject: adminSubject,
        html: adminHtml,
        attachments: attachments.length > 0 ? attachments : undefined,
      })

      console.log("[v0] ✅ Admin email Resend response:", JSON.stringify(adminEmailResult, null, 2))

      if (adminEmailResult.error) {
        console.error("[v0] ❌ Admin email error from Resend:", adminEmailResult.error)
        emailsSent = false
        emailError = adminEmailResult.error
      }
    } catch (error: any) {
      emailsSent = false
      emailError = error?.message || "Email domain not verified"
      console.error("[v0] ❌ ADMIN EMAIL EXCEPTION:", {
        message: error?.message,
        statusCode: error?.statusCode,
        name: error?.name,
        response: error?.response?.data,
        fullError: JSON.stringify(error, null, 2),
      })
    }

    console.log("[v0] === EMAIL SENDING COMPLETE ===")
    console.log("[v0] Emails sent successfully:", emailsSent)
    console.log("[v0] Email error:", emailError)

    return NextResponse.json({
      success: true,
      emailsSent,
      message: emailsSent
        ? "Emails verzonden naar klant en admin"
        : "Bestelling geplaatst, emails worden later verzonden",
      customerEmail: customerEmailResult,
      adminEmail: adminEmailResult,
      emailError,
    })
  } catch (error) {
    console.error("[v0] ❌ FATAL ERROR in email route:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      fullError: JSON.stringify(error, null, 2),
    })
    return NextResponse.json({
      success: true,
      emailsSent: false,
      message: "Bestelling geplaatst, emails worden later verzonden",
      error: "Email service temporarily unavailable",
    })
  }
}
