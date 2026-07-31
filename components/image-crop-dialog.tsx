"use client"

import { useState, useCallback } from "react"
import Cropper, { type Area, type Point } from "react-easy-crop"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { getCroppedImageBlob } from "@/lib/crop-image"

interface ImageCropDialogProps {
  open: boolean
  imageSrc: string | null
  fileName: string
  fileType: string
  onCancel: () => void
  onConfirm: (file: File) => void
}

export function ImageCropDialog({ open, imageSrc, fileName, fileType, onCancel, onConfirm }: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCropComplete = useCallback((_croppedArea: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
      onCancel()
    }
  }

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    setIsProcessing(true)
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, fileType || "image/jpeg")
      const croppedFile = new File([blob], fileName, { type: blob.type })
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
      onConfirm(croppedFile)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Foto bijsnijden</DialogTitle>
        </DialogHeader>

        <div className="relative h-80 w-full bg-muted rounded-lg overflow-hidden">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          )}
        </div>

        <div className="flex items-center gap-3 px-1">
          <span className="text-xs text-muted-foreground shrink-0">Zoom</span>
          <Slider min={1} max={3} step={0.01} value={[zoom]} onValueChange={([v]) => setZoom(v)} />
        </div>

        <p className="text-xs text-muted-foreground">
          Sleep om te verplaatsen, gebruik de zoomslider om in te zoomen. De foto wordt vierkant bijgesneden zodat
          hij netjes in de productkaart past.
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isProcessing}>
            Annuleren
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isProcessing || !croppedAreaPixels}>
            {isProcessing ? "Bezig..." : "Bijsnijden & gebruiken"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
