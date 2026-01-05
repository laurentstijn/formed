"use client"

import { useState, useEffect } from "react"

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    setSelectedImage(0)
  }, [images])

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
        <img
          src={images[selectedImage] || "/placeholder.svg"}
          alt={`${productName} - afbeelding ${selectedImage + 1}`}
          className="w-full h-full object-cover"
        />
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
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
