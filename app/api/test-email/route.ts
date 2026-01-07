import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  console.log("[v0] === EMAIL TEST START ===")
  console.log("[v0] RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY)
  console.log("[v0] RESEND_API_KEY starts with:", process.env.RESEND_API_KEY?.substring(0, 10))

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({
      success: false,
      error: "RESEND_API_KEY is niet geconfigureerd in environment variables",
    })
  }

  try {
    const result = await resend.emails.send({
      from: "FORMD <info@formd.be>",
      to: "info@formd.be",
      subject: "Test Email van FORMD Shop",
      html: `
        <h1>Test Email</h1>
        <p>Deze email is verzonden om te testen of Resend correct is geconfigureerd.</p>
        <p>Als je deze email ontvangt, werkt de email service!</p>
        <p>Verzonden op: ${new Date().toLocaleString("nl-BE")}</p>
      `,
    })

    console.log("[v0] Test email result:", JSON.stringify(result, null, 2))

    if (result.error) {
      console.error("[v0] ❌ Resend error:", result.error)
      return NextResponse.json({
        success: false,
        error: result.error,
        message: "Email kon niet worden verzonden via Resend",
      })
    }

    return NextResponse.json({
      success: true,
      emailId: result.data?.id,
      message: "Test email succesvol verzonden naar info@formd.be",
    })
  } catch (error: any) {
    console.error("[v0] ❌ Test email exception:", {
      message: error?.message,
      statusCode: error?.statusCode,
      name: error?.name,
      stack: error?.stack,
    })

    return NextResponse.json({
      success: false,
      error: error?.message || "Onbekende fout",
      details: {
        name: error?.name,
        statusCode: error?.statusCode,
      },
    })
  }
}
