export function generateShippingConfirmationEmail(order: any): string {
  const orderNumber = order.id.slice(0, 8).toUpperCase()
  const logoUrl =
    "https://txseeeyngm0nlung.public.blob.vercel-storage.com/products/1767593598250-logo%27s_primary%20logo.png"

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                
                <!-- Header with gradient -->
                <!-- Applied website blush pink gradient to header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #fef7f7 0%, #fef5f6 100%); padding: 40px 30px; text-align: center; border-bottom: 3px solid #1a1a1a;">
                    <img src="${logoUrl}" alt="FORMD" style="max-width: 200px; height: auto; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto;">
                    <p style="color: #666666; font-size: 13px; margin: 0; letter-spacing: 1px; font-style: italic;">formd in steel</p>
                  </td>
                </tr>

                <!-- Main content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h1 style="color: #1a1a1a; font-size: 28px; margin: 0 0 20px 0;">Je pakket is onderweg! 📦</h1>
                    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      Goed nieuws! Je bestelling is verzonden en komt binnenkort aan.
                    </p>

                    <!-- Order info box -->
                    <!-- Applied blush pink background -->
                    <div style="background-color: #fef7f7; border-left: 4px solid #1a1a1a; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                      <p style="margin: 0 0 10px 0; color: #1a1a1a; font-size: 14px; font-weight: 400;"><span style="color: #666666; font-weight: 400;">Bestelnummer:</span> #${orderNumber}</p>
                      <p style="margin: 0; color: #1a1a1a; font-size: 14px; font-weight: 600;"><span style="color: #666666; font-weight: 400;">Trackingnummer:</span> ${order.tracking_number || "Volgt spoedig"}</p>
                    </div>

                    ${
                      order.tracking_url
                        ? `
                    <a href="${order.tracking_url}" style="display: inline-block; background-color: #1a1a1a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-bottom: 30px;">
                      Track je pakket
                    </a>
                    `
                        : ""
                    }

                    <h2 style="color: #1a1a1a; font-size: 20px; margin: 30px 0 20px 0;">Bestelde producten</h2>
                    
                    <!-- Products table -->
                    <!-- Applied blush pink to alternate rows -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #f7e8e8; border-radius: 6px; overflow: hidden; margin-bottom: 20px;">
                      <thead>
                        <tr style="background-color: #fef7f7;">
                          <th style="padding: 12px; text-align: left; color: #1a1a1a; font-size: 14px; border-bottom: 1px solid #f7e8e8;">Product</th>
                          <th style="padding: 12px; text-align: center; color: #1a1a1a; font-size: 14px; border-bottom: 1px solid #f7e8e8;">Aantal</th>
                          <th style="padding: 12px; text-align: right; color: #1a1a1a; font-size: 14px; border-bottom: 1px solid #f7e8e8;">Prijs</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${order.items
                          .map(
                            (item: any, index: number) => `
                          <tr style="background-color: ${index % 2 === 0 ? "white" : "#fef9f9"};">
                            <td style="padding: 12px; color: #1a1a1a; border-bottom: 1px solid #f7e8e8;">${item.name}${item.color ? ` - ${item.color}` : ""}</td>
                            <td style="padding: 12px; text-align: center; color: #666666; border-bottom: 1px solid #f7e8e8;">${item.quantity}</td>
                            <td style="padding: 12px; text-align: right; color: #1a1a1a; border-bottom: 1px solid #f7e8e8;">€${(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        `,
                          )
                          .join("")}
                      </tbody>
                    </table>

                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                      Bij vragen over je verzending kun je contact met ons opnemen via <a href="mailto:info@formd.be" style="color: #1a1a1a;">info@formd.be</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <!-- Applied blush pink to footer -->
                <tr>
                  <td style="background-color: #fef7f7; padding: 30px 40px; text-align: center; border-top: 1px solid #f7e8e8;">
                    <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 15px;">FORMD</p>
                    <p style="color: #666666; font-size: 13px; line-height: 1.6; margin: 0;">
                      Bedrijfsstraat 123, 2000 Antwerpen<br>
                      <a href="mailto:info@formd.be" style="color: #666666; text-decoration: none;">info@formd.be</a>
                    </p>
                    <p style="color: #999999; font-size: 12px; margin: 15px 0 0; font-style: italic;">
                      formd in steel
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
