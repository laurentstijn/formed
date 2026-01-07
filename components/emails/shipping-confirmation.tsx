import type * as React from "react"

interface ShippingConfirmationEmailProps {
  orderNumber: string
  customerName: string
  items: Array<{
    name: string
    color?: string
    quantity: number
    price: number
  }>
  totalAmount: number
  shippingAddress: {
    line1: string
    postalCode: string
    city: string
    country: string
  }
  domain: "be" | "nl"
}

export const ShippingConfirmationEmail: React.FC<ShippingConfirmationEmailProps> = ({
  orderNumber,
  customerName,
  items,
  totalAmount,
  shippingAddress,
  domain,
}) => {
  const countryName = domain === "be" ? "België" : "Nederland"
  const fromEmail = domain === "be" ? "info@formd.be" : "info@formd.nl"

  return (
    <html>
      <head>
        <style>
          {`
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #fff; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .success-box { background: #10b981; color: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
            .order-details { background: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .item { padding: 10px 0; border-bottom: 1px solid #eee; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          `}
        </style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1>FORMD {countryName}</h1>
            <p>📦 Je bestelling is verzonden!</p>
          </div>

          <div className="content">
            <p>Beste {customerName},</p>

            <div className="success-box">
              <h2 style={{ margin: 0 }}>✓ Je pakket is onderweg!</h2>
              <p style={{ margin: "10px 0 0 0" }}>Bestelling #{orderNumber}</p>
            </div>

            <p>
              Goed nieuws! Je bestelling is zojuist verzonden en is nu onderweg naar jou. Je kunt je pakket binnen
              enkele werkdagen verwachten.
            </p>

            <div className="order-details">
              <h3>Verzendadres</h3>
              <p>
                {shippingAddress.line1}
                <br />
                {shippingAddress.postalCode} {shippingAddress.city}
                <br />
                {shippingAddress.country}
              </p>
            </div>

            <div className="order-details">
              <h3>Producten in dit pakket:</h3>
              {items.map((item, index) => (
                <div key={index} className="item">
                  <strong>
                    {item.name}
                    {item.color ? ` - ${item.color}` : ""}
                  </strong>
                  <div>Aantal: {item.quantity}</div>
                </div>
              ))}
            </div>

            <p>Heb je vragen over je verzending? Neem gerust contact met ons op via {fromEmail}</p>

            <p>Bedankt voor je aankoop bij FORMD!</p>
          </div>

          <div className="footer">
            <p>
              Met vriendelijke groet,
              <br />
              Het FORMD Team
            </p>
            <p>{fromEmail}</p>
          </div>
        </div>
      </body>
    </html>
  )
}
