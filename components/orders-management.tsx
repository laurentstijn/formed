"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Printer, Package, Check, Trash2, Truck } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Order = {
  id: string
  email: string
  first_name: string
  last_name: string
  address_line1: string
  address_line2: string | null
  city: string
  postal_code: string
  country: string
  phone: string | null
  order_items: any[]
  total_amount: number
  status: string
  created_at: string
  tracking_number: string | null
  tracking_url: string | null
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [trackingUrl, setTrackingUrl] = useState("")

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders")

      if (!response.ok) throw new Error("Failed to fetch orders")

      const data = await response.json()
      setOrders(data.orders)
    } catch (error) {
      console.error("Error loading orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const printShippingLabel = (order: Order) => {
    const labelWindow = window.open("", "_blank")
    if (!labelWindow) return

    const labelHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Verzendlabel - ${order.id.substring(0, 8)}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          @page {
            size: 89mm 36mm;
            margin: 0;
          }
          
          body {
            font-family: Arial, sans-serif;
            width: 89mm;
            height: 36mm;
            padding: 2mm;
            font-size: 8pt;
            line-height: 1.2;
          }
          
          .label {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          
          .header {
            font-weight: bold;
            font-size: 10pt;
            border-bottom: 1px solid #000;
            padding-bottom: 1mm;
            margin-bottom: 1mm;
          }
          
          .address {
            flex: 1;
          }
          
          .address-line {
            margin-bottom: 0.5mm;
          }
          
          .name {
            font-weight: bold;
            font-size: 9pt;
          }
          
          .footer {
            border-top: 1px solid #000;
            padding-top: 1mm;
            margin-top: 1mm;
            font-size: 7pt;
            display: flex;
            justify-content: space-between;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 2mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="header">FORMD</div>
          
          <div class="address">
            <div class="address-line name">${order.first_name} ${order.last_name}</div>
            <div class="address-line">${order.address_line1}</div>
            ${order.address_line2 ? `<div class="address-line">${order.address_line2}</div>` : ""}
            <div class="address-line">${order.postal_code} ${order.city}</div>
            <div class="address-line">${order.country}</div>
          </div>
          
          <div class="footer">
            <span>#${order.id.substring(0, 8).toUpperCase()}</span>
            <span>${new Date(order.created_at).toLocaleDateString("nl-NL")}</span>
            <span>${order.order_items.length} item${order.order_items.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(() => window.print(), 250);
          }
        </script>
      </body>
      </html>
    `

    labelWindow.document.write(labelHTML)
    labelWindow.document.close()
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update order")

      await loadOrders()
    } catch (error) {
      console.error("Error updating order:", error)
      alert("Er is een fout opgetreden bij het bijwerken van de bestelling")
    }
  }

  const deleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete order")

      await loadOrders()
      setOrderToDelete(null)
    } catch (error) {
      console.error("Error deleting order:", error)
      alert("Er is een fout opgetreden bij het verwijderen van de bestelling")
    }
  }

  const openTrackingDialog = (order: Order) => {
    setSelectedOrder(order)
    setTrackingNumber(order.tracking_number || "")
    setTrackingUrl(order.tracking_url || "")
    setTrackingDialogOpen(true)
  }

  const markAsShipped = async () => {
    if (!selectedOrder) return

    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: "shipped",
          tracking_number: trackingNumber || null,
          tracking_url: trackingUrl || null,
        }),
      })

      if (!response.ok) throw new Error("Failed to update order")

      await loadOrders()
      setTrackingDialogOpen(false)
      setSelectedOrder(null)
      setTrackingNumber("")
      setTrackingUrl("")
    } catch (error) {
      console.error("Error marking order as shipped:", error)
      alert("Er is een fout opgetreden bij het verzenden van de bestelling")
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true
    return order.status === statusFilter
  })

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg">Bestellingen laden...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bestellingen</h1>
        <p className="text-muted-foreground mt-1">Beheer bestellingen en print verzendlabels</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          Alle bestellingen
          <Badge variant="secondary" className="ml-2">
            {statusCounts.all}
          </Badge>
        </Button>
        <Button
          variant={statusFilter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("pending")}
        >
          Te verwerken
          <Badge variant="secondary" className="ml-2">
            {statusCounts.pending}
          </Badge>
        </Button>
        <Button
          variant={statusFilter === "processing" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("processing")}
        >
          In behandeling
          <Badge variant="secondary" className="ml-2">
            {statusCounts.processing}
          </Badge>
        </Button>
        <Button
          variant={statusFilter === "shipped" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("shipped")}
        >
          Verzonden
          <Badge variant="secondary" className="ml-2">
            {statusCounts.shipped}
          </Badge>
        </Button>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {order.first_name} {order.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">Bestelling #{order.id.substring(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString("nl-NL")}</p>
                  {order.tracking_number && (
                    <div className="mt-2 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Track & Trace: {order.tracking_number}</span>
                    </div>
                  )}
                </div>
                <Badge
                  variant={
                    order.status === "pending"
                      ? "secondary"
                      : order.status === "processing"
                        ? "default"
                        : order.status === "shipped"
                          ? "outline"
                          : "secondary"
                  }
                >
                  {order.status === "pending"
                    ? "Te verwerken"
                    : order.status === "processing"
                      ? "Verwerken"
                      : order.status === "shipped"
                        ? "Verzonden"
                        : order.status}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium">Contact</p>
                  <p className="text-sm text-muted-foreground">{order.email}</p>
                  {order.phone && <p className="text-sm text-muted-foreground">{order.phone}</p>}
                </div>
                <div>
                  <p className="text-sm font-medium">Verzendadres</p>
                  <p className="text-sm text-muted-foreground">{order.address_line1}</p>
                  {order.address_line2 && <p className="text-sm text-muted-foreground">{order.address_line2}</p>}
                  <p className="text-sm text-muted-foreground">
                    {order.postal_code} {order.city}
                  </p>
                  <p className="text-sm text-muted-foreground">{order.country}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Producten ({order.order_items.length})</p>
                <div className="space-y-1">
                  {order.order_items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.name}
                        {item.color ? ` - ${item.color}` : ""}
                      </span>
                      <span>€{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-lg font-semibold">Totaal: €{order.total_amount.toFixed(2)}</div>
                <div className="flex gap-2">
                  {order.status === "pending" && (
                    <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "processing")}>
                      <Package className="mr-2 h-4 w-4" />
                      Start verwerken
                    </Button>
                  )}
                  {order.status === "processing" && (
                    <Button size="sm" variant="outline" onClick={() => openTrackingDialog(order)}>
                      <Check className="mr-2 h-4 w-4" />
                      Markeer als verzonden
                    </Button>
                  )}
                  <Button size="sm" onClick={() => printShippingLabel(order)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Label
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setOrderToDelete(order.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Verwijder
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              {statusFilter === "all"
                ? "Nog geen bestellingen ontvangen"
                : `Geen bestellingen met status "${
                    statusFilter === "pending"
                      ? "Te verwerken"
                      : statusFilter === "processing"
                        ? "In behandeling"
                        : "Verzonden"
                  }"`}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Track & Trace informatie toevoegen</DialogTitle>
            <DialogDescription>
              Voeg het trackingnummer en tracking URL toe voordat je de bestelling markeert als verzonden.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tracking_number">Trackingnummer (optioneel)</Label>
              <Input
                id="tracking_number"
                placeholder="3SABCD1234567890"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tracking_url">Tracking URL (optioneel)</Label>
              <Input
                id="tracking_url"
                placeholder="https://www.bpost.be/track-trace/..."
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Bijvoorbeeld: https://www.bpost.be/track-trace/ of https://www.postnl.nl/tracktrace/
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={markAsShipped}>
              <Check className="mr-2 h-4 w-4" />
              Markeer als verzonden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Weet je het zeker?</AlertDialogTitle>
            <AlertDialogDescription>
              Deze actie kan niet ongedaan worden gemaakt. De bestelling wordt permanent verwijderd uit de database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => orderToDelete && deleteOrder(orderToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
