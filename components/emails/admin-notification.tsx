import type * as React from "react"

interface AdminNotificationEmailProps {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: Array<{
    name: string
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
  orderDate: string
  domain: "be" | "nl"
}

export const AdminNotificationEmail: React.FC<AdminNotificationEmailProps> = ({
  orderNumber,
  customerName,
  customerEmail,
  items,
  totalAmount,
  shippingAddress,
  orderDate,
}) => {
  return (
    <html>
      <body style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.6", color: "#333", margin: 0, padding: 0 }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
          {/* Header */}
          <div style={{ background: "#000", color: "#fff", padding: "20px" }}>
            <h1 style={{ margin: 0 }}>🔔 Nieuwe Bestelling!</h1>
          </div>

          {/* Alert */}
          <div style={{ background: "#ff6b35", color: "#fff", padding: "15px", margin: "10px 0", borderRadius: "4px" }}>
            <strong>Actie vereist:</strong> Er is een nieuwe bestelling geplaatst die verwerkt moet worden.
          </div>

          {/* Order Info */}
          <div style={{ background: "#f9f9f9", padding: "20px", margin: "20px 0", borderRadius: "8px" }}>
            <h2 style={{ marginTop: 0 }}>Orderinformatie</h2>
            <p>
              <strong>Bestelnummer:</strong> {orderNumber}
            </p>
            <p>
              <strong>Datum:</strong> {orderDate}
            </p>
            <p>
              <strong>Totaalbedrag:</strong> €{totalAmount.toFixed(2)}
            </p>

            <h3>Klantgegevens</h3>
            <p>
              <strong>Naam:</strong> {customerName}
            </p>
            <p>
              <strong>Email:</strong> {customerEmail}
            </p>

            <h3>Verzendadres</h3>
            <p>
              {shippingAddress.line1}
              <br />
              {shippingAddress.postalCode} {shippingAddress.city}
              <br />
              {shippingAddress.country}
            </p>

            <h3>Producten</h3>
            {items.map((item, index) => (
              <div key={index} style={{ padding: "8px 0", borderBottom: "1px solid #ddd" }}>
                <strong>{item.name}</strong> - {item.quantity}x à €{item.price.toFixed(2)}
                <div>Subtotaal: €{(item.quantity * item.price).toFixed(2)}</div>
              </div>
            ))}

            <div style={{ fontSize: "18px", fontWeight: "bold", paddingTop: "10px" }}>
              Totaal: €{totalAmount.toFixed(2)}
            </div>
          </div>

          <p>Log in op het admin panel om deze bestelling te verwerken en een verzendlabel te printen.</p>
        </div>
      </body>
    </html>
  )
}
