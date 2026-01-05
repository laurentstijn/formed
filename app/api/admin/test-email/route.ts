import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { generateOrderConfirmationEmail } from "@/components/email-templates/professional-order-email"
import { generateShippingConfirmationEmail } from "@/components/email-templates/professional-shipping-email"
import { ProfessionalInvoice } from "@/components/email-templates/professional-invoice"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { templateType, recipientEmail } = await request.json()

    console.log("[v0] Test email request received")
    console.log("[v0] Template type:", templateType)
    console.log("[v0] Recipient:", recipientEmail)

    const testOrder = {
      id: "TEST123",
      customer_name: "Test Klant",
      email: recipientEmail,
      items: [
        { name: "Klein Wandhaakje", quantity: 2, price: 24.99 },
        { name: "Groot Wandhaakje", quantity: 1, price: 34.99 },
      ],
      subtotal: 84.97,
      vat: 17.84,
      shipping_cost: 7.5,
      total_amount: 110.31,
      created_at: new Date().toISOString(),
      address_line1: "Teststraat 123",
      city: "Antwerpen",
      postal_code: "2000",
      country: "België",
      tracking_number: "3STEST123456789",
      tracking_url: "https://tracking.postnl.nl/3STEST123456789",
    }

    let html = ""
    let emailSubject = ""

    if (templateType === "order_email") {
      html = generateOrderConfirmationEmail(testOrder)
      emailSubject = "Bedankt voor je bestelling!"
    } else if (templateType === "shipping_email") {
      html = generateShippingConfirmationEmail(testOrder)
      emailSubject = "Je pakket is onderweg!"
    } else if (templateType === "invoice") {
      html = ProfessionalInvoice({
        order: testOrder,
        invoiceNumber: `INV-${testOrder.id}`,
        customer: {
          firstName: "Test",
          lastName: "Klant",
          email: recipientEmail,
          address: `${testOrder.address_line1}, ${testOrder.postal_code} ${testOrder.city}, ${testOrder.country}`,
        },
        companyInfo: {
          name: "FORMD",
          address: "Bedrijfsstraat 123",
          city: "2000 Antwerpen",
          country: "België",
          vat: "BE0123456789",
          email: "info@formd.be",
          phone: "+32 123 45 67 89",
        },
      })
      emailSubject = `Factuur #${testOrder.id}`
    } else {
      // Admin email
      html = `
        <div style="font-family: Arial, sans-serif;">
          <h1 style="color: #1f2937;">Nieuwe bestelling ontvangen</h1>
          <p>Er is een nieuwe bestelling geplaatst die verwerking vereist.</p>
          <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
            <strong>Bestelnummer:</strong> #${testOrder.id}<br>
            <strong>Klant:</strong> ${testOrder.customer_name}<br>
            <strong>Totaal:</strong> €${testOrder.total_amount.toFixed(2)}
          </div>
        </div>
      `
      emailSubject = "Nieuwe bestelling ontvangen"
    }

    console.log("[v0] Generated professional template, length:", html.length)

    const result = await resend.emails.send({
      from: "FORMD <info@formd.be>",
      to: recipientEmail,
      subject: emailSubject,
      html,
    })

    console.log("[v0] Resend API result:", result)

    return NextResponse.json({ success: true, id: result.data?.id })
  } catch (error) {
    console.error("[v0] Error sending test email:", error)
    return NextResponse.json(
      { error: "Failed to send test email", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
