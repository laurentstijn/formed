"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ProductGalleryProps {
  images: string[]
  productName: string
  isOutOfStock?: boolean
}

export function ProductGallery({ images, productName, isOutOfStock = false }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  useEffect(() => {
    setSelectedImage(0)
  }, [images])

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && selectedImage < images.length - 1) {
      setSelectedImage(selectedImage + 1)
    }
    if (isRightSwipe && selectedImage > 0) {
      setSelectedImage(selectedImage - 1)
    }
  }

  const goToPrevious = () => {
    setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const goToNext = () => {
    setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  return (
    <div className="space-y-4">
      {/* Main Image with navigation */}
      <div
        className="relative aspect-square bg-muted rounded-lg overflow-hidden group"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={images[selectedImage] || "/placeholder.svg"}
          alt={`${productName} - afbeelding ${selectedImage + 1}`}
          className="w-full h-full object-contain"
        />

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Uitverkocht</span>
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:flex items-center justify-center"
              aria-label="Vorige afbeelding"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:flex items-center justify-center"
              aria-label="Volgende afbeelding"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute bottom-4 right-4 bg-background/80 text-foreground px-3 py-1 rounded-full text-sm">
              {selectedImage + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === index ? "border-foreground" : "border-border hover:border-muted-foreground"
              }`}
            >
              <img
                src={image || "/placeholder.svg"}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
