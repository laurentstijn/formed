"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

export type CartItem = {
  id: string | number
  name: string
  price: number
  quantity: number
  image: string
  color?: string
  variant_id?: string
  variant_name?: string
  dxf_string?: string
  dxf_filename?: string
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (id: string | number, variantId?: string) => void
  updateQuantity: (id: string | number, quantity: number, variantId?: string) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setItems(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (i) => i.id === item.id && i.color === item.color && i.variant_id === item.variant_id,
      )
      if (existingItem) {
        return currentItems.map((i) =>
          i.id === item.id && i.color === item.color && i.variant_id === item.variant_id
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        )
      }
      return [...currentItems, { ...item, quantity: item.quantity || 1 }]
    })
  }

  const removeItem = (id: string | number, variantId?: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => !(item.id === id && (variantId ? item.variant_id === variantId : true))),
    )
  }

  const updateQuantity = (id: string | number, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeItem(id, variantId)
      return
    }
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id && (variantId ? item.variant_id === variantId : true) ? { ...item, quantity } : item,
      ),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
