"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Package, User, Edit2 } from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { createBrowserClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Order = {
  id: string
  email: string
  first_name: string
  last_name: string
  address_line1: string
  city: string
  postal_code: string
  country: string
  items: any[]
  total_amount: number
  status: string
  created_at: string
  tracking_number: string | null
  tracking_url: string | null
}

type Customer = {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  postal_code: string | null
  country: string | null
}

type InvoiceSettings = {
  company_name: string
  company_subtitle: string
  company_address: string
  company_vat: string | null
  company_phone: string | null
  company_email: string | null
  invoice_footer: string
}

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Customer>>({})
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders")
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null)
  const [invoiceSettingsLoading, setInvoiceSettingsLoading] = useState(true)
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    company_name: "FORMD",
    company_subtitle: "Design & Interieur",
    company_address: "België",
    company_vat: null,
    company_phone: null,
    company_email: null,
    invoice_footer: "Bedankt voor je bestelling!",
  })

  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        const supabase = createBrowserClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setIsLoading(false)
          return
        }

        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (customerError) {
          console.error("[v0] Error fetching customer:", customerError)
          if (customerError.code === "PGRST116") {
            const { data: newCustomer, error: insertError } = await supabase
              .from("customers")
              .insert({
                user_id: user.id,
                email: user.email,
                first_name: "",
                last_name: "",
              })
              .select()
              .single()

            if (insertError) {
              console.error("[v0] Error creating customer:", insertError)
            } else {
              setCustomer(newCustomer as Customer)
              setEditForm(newCustomer as Customer)
            }
          }
        } else {
          setCustomer(customerData as Customer)
          setEditForm(customerData as Customer)
        }

        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .eq("email", user.email)
          .order("created_at", { ascending: false })

        if (ordersData) {
          setOrders(ordersData)
        }
      } catch (error) {
        console.error("Error loading customer data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    const loadInvoiceSettings = async () => {
      try {
        const supabase = createBrowserClient()
        const { data, error } = await supabase.from("invoice_settings").select("*").maybeSingle()

        if (error) {
          console.error("[v0] Error loading invoice settings:", error)
          setInvoiceSettingsLoading(false)
          return
        }

        if (data) {
          setInvoiceSettings({
            company_name: data.company_name || "FORMD",
            company_subtitle: data.company_subtitle || "Design & Interieur",
            company_address: data.company_address || "België",
            company_vat: data.company_vat,
            company_phone: data.company_phone,
            company_email: data.company_email,
            invoice_footer: data.invoice_footer || "Bedankt voor je bestelling!",
          })
        }
      } catch (error) {
        console.error("[v0] Failed to load invoice settings:", error)
      } finally {
        setInvoiceSettingsLoading(false)
      }
    }

    loadCustomerData()
    loadInvoiceSettings()
  }, [])

  const handleSaveProfile = async () => {
    try {
      const supabase = createBrowserClient()

      console.log("[v0] Saving profile:", editForm)

      const { data, error, status, statusText } = await supabase
        .from("customers")
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          phone: editForm.phone,
          address_line1: editForm.address_line1,
          address_line2: editForm.address_line2,
          city: editForm.city,
          postal_code: editForm.postal_code,
          country: editForm.country,
        })
        .eq("id", customer.id)
        .select()

      console.log("[v0] Update response:", { data, error, status, statusText })

      if (error) {
        console.error("[v0] Error saving profile:", error)
        alert(`Er is een fout opgetreden: ${error.message}`)
        return
      }

      if (!data || data.length === 0) {
        console.error("[v0] No data returned from update - RLS policy may be blocking")
        alert("Er is een fout opgetreden bij het opslaan. Mogelijk heb je geen rechten om deze gegevens te wijzigen.")
        return
      }

      console.log("[v0] Profile saved successfully:", data)
      setCustomer(data[0] as Customer)
      setIsEditing(false)
      alert("Je gegevens zijn succesvol opgeslagen!")
    } catch (error) {
      console.error("[v0] Exception updating profile:", error)
      alert("Er is een fout opgetreden bij het opslaan van je gegevens")
    }
  }

  const generateInvoiceNumber = (order: Order) => {
    const date = new Date(order.created_at)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const sequential = order.id.substring(0, 4).toUpperCase()
    return `FORMD-${year}${month}-${sequential}`
  }

  const handleOpenInvoice = (order: Order) => {
    if (invoiceSettingsLoading) {
      console.log("[v0] Waiting for invoice settings to load...")
      return
    }
    setSelectedInvoiceOrder(order)
    setInvoiceDialogOpen(true)
  }

  const downloadInvoicePDF = (order: Order) => {
    const invoiceHTML = generateInvoiceHTML(order)
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(invoiceHTML)
    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.print()
    }
  }

  const generateInvoiceHTML = (order: Order) => {
    const invoiceNumber = generateInvoiceNumber(order)
    const orderDate = new Date(order.created_at).toLocaleDateString("nl-BE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { 
      size: A4;
      margin: 15mm 20mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1a1a1a;
      line-height: 1.5;
      padding: 20px;
      background: white;
      font-size: 13px;
    }
    
    .invoice-container {
      max-width: 100%;
      margin: 0 auto;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #7C7D7E;
    }
    
    .logo-section img {
      height: 60px;
      width: auto;
      display: block;
    }
    
    .invoice-meta {
      text-align: right;
    }
    
    .invoice-title {
      font-size: 28px;
      font-weight: 700;
      color: #7C7D7E;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    
    .invoice-number {
      font-size: 13px;
      color: #666;
      margin-bottom: 3px;
    }
    
    .invoice-date {
      font-size: 13px;
      color: #666;
    }
    
    .addresses {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin: 25px 0 30px 0;
    }
    
    .address-block h3 {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #999;
      margin-bottom: 10px;
    }
    
    .address-block p {
      font-size: 13px;
      line-height: 1.6;
      color: #333;
    }
    
    .address-company {
      font-weight: 600;
      color: #000;
      margin-bottom: 3px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    
    thead {
      background: #f8f9fa;
    }
    
    th {
      padding: 12px 10px;
      text-align: left;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #666;
      border-bottom: 2px solid #e0e0e0;
    }
    
    td {
      padding: 12px 10px;
      font-size: 13px;
      border-bottom: 1px solid #f0f0f0;
    }
    
    tbody tr:last-child td {
      border-bottom: none;
    }
    
    .text-right {
      text-align: right;
    }
    
    .text-center {
      text-align: center;
    }
    
    .totals {
      margin-top: 25px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
    }
    
    .totals-row {
      display: flex;
      justify-content: flex-end;
      padding: 8px 0;
      font-size: 13px;
    }
    
    .totals-label {
      width: 180px;
      text-align: right;
      padding-right: 30px;
      color: #666;
    }
    
    .totals-value {
      width: 100px;
      text-align: right;
      font-weight: 500;
    }
    
    .totals-row.final {
      border-top: 2px solid #7C7D7E;
      padding-top: 15px;
      margin-top: 8px;
      font-size: 16px;
      font-weight: 700;
    }
    
    .totals-row.final .totals-label {
      color: #000;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
    }
    
    .thank-you {
      font-size: 16px;
      font-weight: 600;
      color: #7C7D7E;
      margin-bottom: 12px;
    }
    
    .company-info {
      font-size: 12px;
      color: #999;
      line-height: 1.6;
    }
    
    @media print {
      body { padding: 0; }
      .invoice-container { max-width: none; }
      @page { 
        size: A4 portrait;
        margin: 15mm 20mm;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="logo-section">
        <img src="/formed-in-steel-logo.png" alt="formd in steel" />
      </div>
      <div class="invoice-meta">
        <div class="invoice-title">FACTUUR</div>
        <div class="invoice-number">Nr: ${invoiceNumber}</div>
        <div class="invoice-date">Datum: ${orderDate}</div>
      </div>
    </div>
    
    <div class="addresses">
      <div class="address-block">
        <h3>Van</h3>
        <p class="address-company">${invoiceSettings.company_name}</p>
        ${invoiceSettings.company_subtitle ? `<p>${invoiceSettings.company_subtitle}</p>` : ""}
        <p>${invoiceSettings.company_address}</p>
        ${invoiceSettings.company_vat ? `<p>BTW: ${invoiceSettings.company_vat}</p>` : ""}
        ${invoiceSettings.company_email ? `<p>${invoiceSettings.company_email}</p>` : ""}
        ${invoiceSettings.company_phone ? `<p>${invoiceSettings.company_phone}</p>` : ""}
      </div>
      
      <div class="address-block">
        <h3>Factuuradres</h3>
        <p class="address-company">${order.first_name} ${order.last_name}</p>
        ${order.address_line1 ? `<p>${order.address_line1}</p>` : ""}
        ${order.address_line2 ? `<p>${order.address_line2}</p>` : ""}
        <p>${order.postal_code} ${order.city}</p>
        <p>${order.country || "België"}</p>
        ${order.email ? `<p>${order.email}</p>` : ""}
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th class="text-center">Aantal</th>
          <th class="text-right">Prijs</th>
          <th class="text-right">Totaal</th>
        </tr>
      </thead>
      <tbody>
        ${order.items
          .map(
            (item: any) => `
          <tr>
            <td>${item.name}</td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-right">€${item.price.toFixed(2)}</td>
            <td class="text-right">€${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
    
    <div class="totals">
      <div class="totals-row">
        <div class="totals-label">Subtotaal (excl. BTW)</div>
        <div class="totals-value">€${(order.total_amount / 1.21).toFixed(2)}</div>
      </div>
      <div class="totals-row">
        <div class="totals-label">BTW (21%)</div>
        <div class="totals-value">€${(order.total_amount - order.total_amount / 1.21).toFixed(2)}</div>
      </div>
      <div class="totals-row final">
        <div class="totals-label">TOTAAL (incl. BTW)</div>
        <div class="totals-value">€${order.total_amount.toFixed(2)}</div>
      </div>
    </div>
    
    <div class="footer">
      <div class="thank-you">${invoiceSettings.invoice_footer}</div>
      <div class="company-info">
        ${invoiceSettings.company_name}${invoiceSettings.company_subtitle ? ` - ${invoiceSettings.company_subtitle}` : ""} | ${invoiceSettings.company_address}<br>
        ${invoiceSettings.company_email || ""}
      </div>
    </div>
  </div>
</body>
</html>`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Laden...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Mijn Account</h1>
          {customer && <p className="text-muted-foreground">{customer.email}</p>}
        </div>

        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === "orders"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="inline-block mr-2 h-4 w-4" />
            Mijn Bestellingen
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === "profile"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="inline-block mr-2 h-4 w-4" />
            Mijn Gegevens
          </button>
        </div>

        {activeTab === "orders" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Mijn Bestellingen</h2>
            </div>

            {orders.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Nog geen bestellingen</p>
                  <p className="text-muted-foreground mb-6">Start met winkelen om je eerste bestelling te plaatsen</p>
                  <Link href="/">
                    <Button>Naar Shop</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Bestelling {generateInvoiceNumber(order)}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(order.created_at).toLocaleDateString("nl-NL", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          {order.status === "shipped" && order.tracking_number && (
                            <div className="mt-2 space-y-1">
                              <p className="text-sm font-medium text-green-600">✓ Verzonden</p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Track & Trace:</span>
                                <span className="text-xs font-mono">{order.tracking_number}</span>
                              </div>
                              {order.tracking_url && (
                                <a
                                  href={order.tracking_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                  🔍 Volg je pakket
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.name}</p>
                              <p className="text-sm text-muted-foreground">Aantal: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Totaal</p>
                          <p className="text-xl font-bold">€{order.total_amount.toFixed(2)}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleOpenInvoice(order)}>
                          <Download className="mr-2 h-4 w-4" />
                          Factuur
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Mijn Gegevens</h2>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Bewerken
                </Button>
              )}
            </div>

            <Card>
              <CardContent className="pt-6">
                {!customer ? (
                  <p className="text-muted-foreground">Geen klantgegevens beschikbaar</p>
                ) : isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name">Voornaam</Label>
                        <Input
                          id="first_name"
                          value={editForm.first_name || ""}
                          onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="last_name">Achternaam</Label>
                        <Input
                          id="last_name"
                          value={editForm.last_name || ""}
                          onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={customer.email} disabled className="bg-muted" />
                      <p className="text-sm text-muted-foreground mt-1">Email kan niet worden gewijzigd</p>
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefoonnummer</Label>
                      <Input
                        id="phone"
                        value={editForm.phone || ""}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-medium">Standaard Verzendadres</h3>

                      <div>
                        <Label htmlFor="address_line1">Straat en huisnummer</Label>
                        <Input
                          id="address_line1"
                          value={editForm.address_line1 || ""}
                          onChange={(e) => setEditForm({ ...editForm, address_line1: e.target.value })}
                          placeholder="Voorbeeldstraat 123"
                        />
                      </div>

                      <div>
                        <Label htmlFor="address_line2">Adresregel 2 (optioneel)</Label>
                        <Input
                          id="address_line2"
                          value={editForm.address_line2 || ""}
                          onChange={(e) => setEditForm({ ...editForm, address_line2: e.target.value })}
                          placeholder="Bus 4"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="postal_code">Postcode</Label>
                          <Input
                            id="postal_code"
                            value={editForm.postal_code || ""}
                            onChange={(e) => setEditForm({ ...editForm, postal_code: e.target.value })}
                            placeholder="1000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">Stad</Label>
                          <Input
                            id="city"
                            value={editForm.city || ""}
                            onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                            placeholder="Brussel"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="country">Land</Label>
                        <Select
                          id="country"
                          defaultValue={editForm.country || "België"}
                          onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecteer een land" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="België">België</SelectItem>
                            <SelectItem value="Nederland">Nederland</SelectItem>
                            {/* Add more countries as needed */}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSaveProfile}>
                        <Download className="mr-2 h-4 w-4" />
                        Opslaan
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setEditForm(customer)
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Annuleren
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Naam</p>
                        <p className="font-medium">
                          {customer.first_name} {customer.last_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{customer.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Telefoon</p>
                        <p className="font-medium">{customer.phone || "Niet ingevuld"}</p>
                      </div>
                    </div>

                    {(customer.address_line1 || customer.city) && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-2">Standaard Verzendadres</p>
                        <div className="space-y-1">
                          {customer.address_line1 && <p className="font-medium">{customer.address_line1}</p>}
                          {customer.address_line2 && <p className="font-medium">{customer.address_line2}</p>}
                          {(customer.postal_code || customer.city) && (
                            <p className="font-medium">
                              {customer.postal_code} {customer.city}
                            </p>
                          )}
                          {customer.country && <p className="font-medium">{customer.country}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {!invoiceSettingsLoading && selectedInvoiceOrder && (
        <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
          <DialogContent className="max-w-7xl h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Factuur {selectedInvoiceOrder && generateInvoiceNumber(selectedInvoiceOrder)}</DialogTitle>
              <DialogDescription>Besteldetails en factuurinformatie</DialogDescription>
            </DialogHeader>
            {selectedInvoiceOrder && (
              <div className="bg-white rounded-lg">
                <iframe
                  srcDoc={generateInvoiceHTML(selectedInvoiceOrder)}
                  className="w-full h-full border-0"
                  title="Invoice Preview"
                />
              </div>
            )}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setInvoiceDialogOpen(false)}>
                Sluiten
              </Button>
              <Button onClick={() => selectedInvoiceOrder && downloadInvoicePDF(selectedInvoiceOrder)}>
                <Download className="mr-2 h-4 w-4" />
                Download als PDF
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
