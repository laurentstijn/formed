"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronRight, Package, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
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

type Customer = {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  created_at: string
}

type Order = {
  id: number
  total_amount: number
  status: string
  created_at: string
  items: Array<{
    product_id: number
    name: string
    quantity: number
    price: number
  }>
}

export default function CustomersManagement() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerOrders, setCustomerOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const response = await fetch("/api/admin/customers")

      if (!response.ok) throw new Error("Failed to fetch customers")

      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error("Error loading customers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCustomerOrders = async (customerId: string) => {
    setLoadingOrders(true)
    try {
      const response = await fetch(`/api/admin/customers/${customerId}/orders`)
      if (!response.ok) throw new Error("Failed to fetch customer orders")
      const data = await response.json()
      setCustomerOrders(data)
    } catch (error) {
      console.error("Error loading customer orders:", error)
      setCustomerOrders([])
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    loadCustomerOrders(customer.id)
  }

  const deleteCustomer = async (customerId: string) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete customer")

      await loadCustomers()
      setCustomerToDelete(null)
      setSelectedCustomer(null)
    } catch (error) {
      console.error("Error deleting customer:", error)
      alert("Er is een fout opgetreden bij het verwijderen van de klant")
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg">Klanten laden...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Klanten</h1>
        <p className="text-muted-foreground mt-1">Overzicht van alle klanten</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Zoek op naam of email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-1">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            className="flex items-center justify-between py-2 px-3 hover:bg-accent rounded-md cursor-pointer transition-colors"
            onClick={() => handleCustomerClick(customer)}
          >
            <span className="font-medium">
              {customer.first_name} {customer.last_name}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              {searchTerm ? "Geen klanten gevonden met deze zoekopdracht" : "Nog geen klanten"}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={!!selectedCustomer}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCustomer(null)
            setCustomerOrders([])
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Klantgegevens</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="flex justify-end -mt-2">
                <Button variant="destructive" size="sm" onClick={() => setCustomerToDelete(selectedCustomer)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Verwijder klant
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Voornaam</label>
                  <p className="text-lg">{selectedCustomer.first_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Achternaam</label>
                  <p className="text-lg">{selectedCustomer.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-lg">{selectedCustomer.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefoon</label>
                  <p className="text-lg">{selectedCustomer.phone || "Niet opgegeven"}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Klant sinds</label>
                  <p className="text-lg">
                    {new Date(selectedCustomer.created_at).toLocaleDateString("nl-NL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Bestellingen ({customerOrders.length})</h3>
                </div>

                {loadingOrders ? (
                  <p className="text-muted-foreground">Orders laden...</p>
                ) : customerOrders.length > 0 ? (
                  <div className="space-y-3">
                    {customerOrders.map((order) => (
                      <Card key={order.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold">Bestelling #{order.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString("nl-NL", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={
                                  order.status === "shipped"
                                    ? "default"
                                    : order.status === "processing"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {order.status === "pending"
                                  ? "Te verwerken"
                                  : order.status === "processing"
                                    ? "Verwerken"
                                    : "Verzonden"}
                              </Badge>
                              <p className="font-bold mt-1">€{order.total_amount.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="text-sm flex justify-between">
                                <span>
                                  {item.quantity}x {item.name}
                                </span>
                                <span className="text-muted-foreground">
                                  €{(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">Nog geen bestellingen</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!customerToDelete} onOpenChange={() => setCustomerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Weet je het zeker?</AlertDialogTitle>
            <AlertDialogDescription>
              Deze actie kan niet ongedaan worden gemaakt. De klant, alle bijbehorende bestellingen en gegevens worden
              permanent verwijderd uit de database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => customerToDelete && deleteCustomer(customerToDelete.id)}
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
