"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { TrendingUp, Package, ShoppingCart, Euro } from "lucide-react"

interface OrderStats {
  totalOrders: number
  totalRevenue: number
  avgOrderValue: number
}

interface ProductSales {
  product_id: number
  product_name: string
  total_quantity: number
  total_revenue: number
  order_count: number
}

export function StatisticsDashboard() {
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null)
  const [productSales, setProductSales] = useState<ProductSales[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    const supabase = createClient()

    try {
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })

      if (ordersError) {
        console.error("Error fetching orders:", ordersError)
        setIsLoading(false)
        return
      }

      const totalOrders = orders?.length || 0
      const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      setOrderStats({
        totalOrders,
        totalRevenue,
        avgOrderValue,
      })

      const productSalesMap = new Map<number, ProductSales>()

      orders?.forEach((order) => {
        order.items?.forEach((item: any) => {
          const existing = productSalesMap.get(item.product_id)
          if (existing) {
            existing.total_quantity += item.quantity
            existing.total_revenue += item.price * item.quantity
            existing.order_count += 1
          } else {
            productSalesMap.set(item.product_id, {
              product_id: item.product_id,
              product_name: item.name,
              total_quantity: item.quantity,
              total_revenue: item.price * item.quantity,
              order_count: 1,
            })
          }
        })
      })

      const sortedProductSales = Array.from(productSalesMap.values()).sort((a, b) => b.total_revenue - a.total_revenue)

      setProductSales(sortedProductSales)
    } catch (error) {
      console.error("Error loading statistics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-lg">Laden...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-sans font-bold">Verkoop Statistieken</h1>
        <p className="text-muted-foreground">Overzicht van alle verkochte producten</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Bestellingen</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats?.totalOrders || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Omzet</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{orderStats?.totalRevenue.toFixed(2) || "0.00"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gemiddelde Orderwaarde</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{orderStats?.avgOrderValue.toFixed(2) || "0.00"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Product Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Verkochte Producten</CardTitle>
          <CardDescription>Gesorteerd op omzet</CardDescription>
        </CardHeader>
        <CardContent>
          {productSales.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nog geen verkopen</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Product</th>
                    <th className="text-right py-3 px-4 font-medium">Verkocht</th>
                    <th className="text-right py-3 px-4 font-medium">Bestellingen</th>
                    <th className="text-right py-3 px-4 font-medium">Omzet</th>
                  </tr>
                </thead>
                <tbody>
                  {productSales.map((product) => (
                    <tr key={product.product_id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          {product.product_name}
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">{product.total_quantity}x</td>
                      <td className="text-right py-3 px-4">{product.order_count}</td>
                      <td className="text-right py-3 px-4 font-semibold">€{product.total_revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold">
                    <td className="py-3 px-4">Totaal</td>
                    <td className="text-right py-3 px-4">
                      {productSales.reduce((sum, p) => sum + p.total_quantity, 0)}x
                    </td>
                    <td className="text-right py-3 px-4">{productSales.reduce((sum, p) => sum + p.order_count, 0)}</td>
                    <td className="text-right py-3 px-4">
                      €{productSales.reduce((sum, p) => sum + p.total_revenue, 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
