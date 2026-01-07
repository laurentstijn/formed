import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    console.log("[v0] Contact form data received:", { name, email, subject })

    // Validate input
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Alle velden zijn verplicht" }, { status: 400 })
    }

    const [adminEmailResult, customerEmailResult] = await Promise.all([
      // Email to admin
      resend.emails.send({
        from: "FORMD Contact <noreply@formd.be>",
        to: "info@formd.be",
        replyTo: email,
        subject: `Nieuw contactformulier bericht: ${subject}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #000; color: #fff; padding: 20px; text-align: center; }
                .content { background: #f9f9f9; padding: 30px; margin-top: 20px; border-radius: 8px; }
                .field { margin-bottom: 20px; }
                .label { font-weight: bold; color: #555; margin-bottom: 5px; }
                .value { color: #333; padding: 10px; background: #fff; border-radius: 4px; }
                .message-box { background: #fff; padding: 20px; border-left: 4px solid #000; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>FORMD</h1>
                  <p>Nieuw contactformulier bericht</p>
                </div>
                <div class="content">
                  <div class="field">
                    <div class="label">Van:</div>
                    <div class="value">${name}</div>
                  </div>
                  <div class="field">
                    <div class="label">E-mail:</div>
                    <div class="value">${email}</div>
                  </div>
                  <div class="field">
                    <div class="label">Onderwerp:</div>
                    <div class="value">${subject}</div>
                  </div>
                  <div class="message-box">
                    <div class="label">Bericht:</div>
                    <p>${message.replace(/\n/g, "<br>")}</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
      // Email to customer
      resend.emails.send({
        from: "FORMD <noreply@formd.be>",
        to: email,
        subject: "Bevestiging van uw bericht aan FORMD",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #000; color: #fff; padding: 20px; text-align: center; }
                .content { background: #f9f9f9; padding: 30px; margin-top: 20px; border-radius: 8px; }
                .message-box { background: #fff; padding: 20px; border-left: 4px solid #000; margin-top: 20px; }
                .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>FORMD</h1>
                </div>
                <div class="content">
                  <h2>Bedankt voor uw bericht!</h2>
                  <p>Beste ${name},</p>
                  <p>We hebben uw bericht goed ontvangen en zullen zo spoedig mogelijk contact met u opnemen.</p>
                  
                  <div class="message-box">
                    <p><strong>Uw bericht:</strong></p>
                    <p><strong>Onderwerp:</strong> ${subject}</p>
                    <p>${message.replace(/\n/g, "<br>")}</p>
                  </div>
                  
                  <p style="margin-top: 30px;">Met vriendelijke groet,<br><strong>Team FORMD</strong></p>
                </div>
                <div class="footer">
                  <p>FORMD - formd in steel</p>
                  <p>E-mail: info@formd.be</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    ])

    console.log("[v0] Contact emails sent:", { admin: adminEmailResult, customer: customerEmailResult })

    return NextResponse.json({ success: true, message: "Bericht verzonden" })
  } catch (error) {
    console.error("[v0] Contact form error:", error)
    return NextResponse.json({ error: "Er ging iets mis bij het verzenden van uw bericht" }, { status: 500 })
  }
}
