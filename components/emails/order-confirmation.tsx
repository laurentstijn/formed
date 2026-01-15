import type * as React from "react"

interface OrderConfirmationEmailProps {
  orderNumber: string
  customerName: string
  items: Array<{
    name: string
    quantity: number
    price: number
    variant_name?: string
    color?: string
  }>
  totalAmount: number
  shippingAddress: {
    line1: string
    postalCode: string
    city: string
    country: string
  }
  orderDate: string
  domain: "be" | "nl"
}

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  orderNumber,
  customerName,
  items,
  totalAmount,
  shippingAddress,
  orderDate,
  domain,
}) => {
  const countryName = domain === "be" ? "België" : "Nederland"
  const fromEmail = domain === "be" ? "info@formd.be" : "info@formd.nl"

  return (
    <html>
      <body style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.6", color: "#333", margin: 0, padding: 0 }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
          {/* Header */}
          <div style={{ background: "#000", color: "#fff", padding: "30px", textAlign: "center" }}>
            <h1 style={{ margin: 0, fontSize: "24px" }}>FORMD {countryName}</h1>
            <p style={{ margin: "10px 0 0 0", fontSize: "16px" }}>Bestelbevestiging</p>
          </div>

          {/* Content */}
          <div style={{ padding: "30px", background: "#f9f9f9" }}>
            <p>Beste {customerName},</p>
            <p>
              Bedankt voor je bestelling bij FORMD! We hebben je order succesvol ontvangen en beginnen direct met de
              verwerking.
            </p>

            {/* Order Details */}
            <div style={{ background: "#fff", padding: "20px", margin: "20px 0", borderRadius: "8px" }}>
              <h2 style={{ marginTop: 0 }}>Orderdetails</h2>
              <p>
                <strong>Bestelnummer:</strong> {orderNumber}
              </p>
              <p>
                <strong>Datum:</strong> {orderDate}
              </p>

              <h3>Producten:</h3>
              {items.map((item, index) => (
                <div key={index} style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}>
                  <strong>{item.name}</strong>
                  {item.variant_name && <span> - {item.variant_name}</span>}
                  {item.color && <span> ({item.color})</span>}
                  <div>
                    Aantal: {item.quantity} × €{item.price.toFixed(2)}
                  </div>
                  <div>Subtotaal: €{(item.quantity * item.price).toFixed(2)}</div>
                </div>
              ))}

              <div style={{ fontSize: "18px", fontWeight: "bold", paddingTop: "15px" }}>
                Totaal: €{totalAmount.toFixed(2)}
              </div>
            </div>

            {/* Shipping Address */}
            <div style={{ background: "#fff", padding: "20px", margin: "20px 0", borderRadius: "8px" }}>
              <h3 style={{ marginTop: 0 }}>Verzendadres</h3>
              <p>
                {shippingAddress.line1}
                <br />
                {shippingAddress.postalCode} {shippingAddress.city}
                <br />
                {shippingAddress.country}
              </p>
            </div>

            <p>
              Je bestelling wordt binnenkort verzonden. Je ontvangt een Track & Trace code zodra het pakket onderweg is.
            </p>

            <p>Heb je vragen over je bestelling? Neem gerust contact met ons op via {fromEmail}</p>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", padding: "20px", color: "#666", fontSize: "14px" }}>
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
