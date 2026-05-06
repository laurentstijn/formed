import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { filename, dxfContent } = await request.json();
    
    // Converteer de DXF string naar een Buffer voor de e-mail bijlage
    const buffer = Buffer.from(dxfContent, 'utf-8');

    const result = await resend.emails.send({
      from: "FORMD Configurator <noreply@formd.be>",
      to: "info@formd.be",
      subject: `Nieuwe Douchegoot Configuratie: ${filename}`,
      html: `
        <h2>Nieuwe Douchegoot Configuratie</h2>
        <p>Er is een nieuwe douchegoot geconfigureerd op de website.</p>
        <p>In de bijlage vind je het productieklare DXF bestand dat direct klaar is voor de laser.</p>
        <br/>
        <p><strong>Bestandsnaam:</strong> ${filename}</p>
      `,
      attachments: [
        {
          filename: filename,
          content: buffer,
        }
      ]
    });
    
    return NextResponse.json({ success: true, message: "DXF is succesvol gemaild naar info@formd.be" });
  } catch (error) {
    console.error("Error sending DXF email:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
